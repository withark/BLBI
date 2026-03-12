#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any
from urllib import error, request


TEXT_EXTENSIONS = {
    ".css",
    ".gitignore",
    ".js",
    ".json",
    ".md",
    ".mjs",
    ".nvmrc",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml",
}

SKIP_PATHS = {
    "data/app-db.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "tsconfig.tsbuildinfo",
    "yarn.lock",
}

PRIORITY_PATHS = [
    "docs/project-master-spec.md",
    "README.md",
    "package.json",
    "tsconfig.json",
]

RESULT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["summary", "commit_message", "notes", "files", "delete_files"],
    "properties": {
        "summary": {"type": "string"},
        "commit_message": {"type": "string"},
        "notes": {"type": "string"},
        "files": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["path", "content"],
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                },
            },
        },
        "delete_files": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
}

SYSTEM_INSTRUCTIONS = """
You are a remote coding worker running inside GitHub Actions on a real repository.

Rules:
- Make the requested code changes directly in the repository context you receive.
- Keep edits minimal, coherent, and production-minded.
- Treat docs/project-master-spec.md as the product source of truth.
- Do not touch secrets, node_modules, generated build output, or binary files.
- Return only the files that need to change, with their full final contents.
- If a file should be deleted, list it in delete_files.
- If no safe or necessary code change is required, return empty files/delete_files and explain why in notes.
- Assume you will be followed by automated checks. Prefer changes that are likely to pass immediately.
- Output must match the JSON schema exactly.
""".strip()


def run(cmd: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=str(cwd),
        check=check,
        text=True,
        capture_output=True,
    )


def git(repo: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return run(["git", *args], cwd=repo, check=check)


def tracked_files(repo: Path) -> list[str]:
    output = git(repo, "ls-files").stdout
    return [line.strip() for line in output.splitlines() if line.strip()]


def include_path(path: str) -> bool:
    if path in SKIP_PATHS:
        return False

    if path.startswith((".git/", ".github/actions/", ".next/", "node_modules/")):
        return False

    suffix = Path(path).suffix
    if suffix in TEXT_EXTENSIONS:
        return True

    name = Path(path).name
    return name in {".gitignore", ".nvmrc"}


def safe_read(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return None


def ordered_paths(paths: list[str]) -> list[str]:
    priority = {value: index for index, value in enumerate(PRIORITY_PATHS)}
    return sorted(paths, key=lambda item: (priority.get(item, 10_000), item))


def build_repo_context(repo: Path) -> str:
    included = [path for path in tracked_files(repo) if include_path(path)]
    blocks: list[str] = []
    total_chars = 0
    max_chars = 220_000

    for path in ordered_paths(included):
        text = safe_read(repo / path)
        if text is None:
            continue

        block = f"=== {path} ===\n{text}\n"
        if total_chars + len(block) > max_chars:
            break

        blocks.append(block)
        total_chars += len(block)

    tree = "\n".join(f"- {path}" for path in ordered_paths(included))
    return f"Repository files:\n{tree}\n\nRepository contents:\n\n" + "\n".join(blocks)


def build_user_prompt(task: str, repo_context: str, feedback: str | None) -> str:
    sections = [
        "Task:",
        task.strip(),
        "",
        repo_context,
    ]

    if feedback:
        sections.extend(
            [
                "",
                "Previous attempt feedback:",
                feedback.strip(),
                "",
                "Repair the repository and return an updated JSON result.",
            ]
        )

    return "\n".join(sections).strip()


def http_request(method: str, url: str, api_key: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = None
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = request.Request(url=url, method=method, headers=headers, data=data)

    try:
        with request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API error {exc.code}: {body}") from exc


def extract_output_text(response_json: dict[str, Any]) -> str:
    output_text = response_json.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text

    parts: list[str] = []
    for item in response_json.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                parts.append(content.get("text", ""))

    text = "".join(parts).strip()
    if not text:
        raise RuntimeError("Model response did not contain output text.")

    return text


def call_remote_coder(
    api_key: str,
    model: str,
    reasoning_effort: str,
    task: str,
    repo_context: str,
    feedback: str | None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": model,
        "background": True,
        "reasoning": {"effort": reasoning_effort},
        "instructions": SYSTEM_INSTRUCTIONS,
        "input": build_user_prompt(task, repo_context, feedback),
        "max_output_tokens": 80_000,
        "text": {
            "format": {
                "type": "json_schema",
                "name": "remote_coder_result",
                "strict": True,
                "schema": RESULT_SCHEMA,
            }
        },
    }

    created = http_request(
        "POST",
        "https://api.openai.com/v1/responses",
        api_key=api_key,
        payload=payload,
    )

    response_id = created.get("id")
    if not response_id:
        raise RuntimeError("OpenAI response did not include an id.")

    deadline = time.time() + 12 * 60
    current = created

    while current.get("status") in {"queued", "in_progress"}:
        if time.time() > deadline:
            raise RuntimeError("Timed out while waiting for the remote coder response.")
        time.sleep(5)
        current = http_request(
            "GET",
            f"https://api.openai.com/v1/responses/{response_id}",
            api_key=api_key,
        )

    if current.get("status") != "completed":
        raise RuntimeError(f"Remote coder did not complete successfully: {json.dumps(current)}")

    raw_text = extract_output_text(current)
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Remote coder returned invalid JSON: {raw_text}") from exc


def safe_repo_path(repo: Path, relative_path: str) -> Path:
    candidate = (repo / relative_path).resolve()
    repo_root = repo.resolve()

    if not str(candidate).startswith(str(repo_root)):
        raise RuntimeError(f"Refusing to write outside the repository: {relative_path}")

    return candidate


def apply_result(repo: Path, result: dict[str, Any]) -> None:
    for relative_path in result.get("delete_files", []):
        target = safe_repo_path(repo, relative_path)
        if target.exists():
            target.unlink()

    for file_entry in result.get("files", []):
        relative_path = file_entry["path"]
        target = safe_repo_path(repo, relative_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(file_entry["content"], encoding="utf-8")


def changed_files(repo: Path) -> list[str]:
    diff = git(repo, "diff", "--name-only", check=False).stdout
    return [line.strip() for line in diff.splitlines() if line.strip()]


def run_check_command(repo: Path, command: str) -> tuple[bool, str]:
    completed = subprocess.run(
        command,
        cwd=str(repo),
        shell=True,
        text=True,
        capture_output=True,
    )
    combined = (completed.stdout or "") + (completed.stderr or "")
    return completed.returncode == 0, combined.strip()


def tail_lines(text: str, limit: int = 120) -> str:
    lines = text.splitlines()
    if len(lines) <= limit:
        return "\n".join(lines)
    return "\n".join(lines[-limit:])


def sanitize_commit_message(message: str) -> str:
    compact = " ".join(message.split())
    return compact[:120] if compact else "Remote coder update"


def save_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True)
    parser.add_argument("--task", required=True)
    parser.add_argument("--result-file", required=True)
    parser.add_argument("--attempts", type=int, default=2)
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    result_file = Path(args.result_file).resolve()
    api_key = os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_REMOTE_CODER_MODEL", "gpt-5.3-codex")
    reasoning_effort = os.environ.get("OPENAI_REMOTE_CODER_REASONING", "high")
    check_command = os.environ.get("REMOTE_CODER_CHECK_COMMAND", "npm run check")

    if not api_key:
        save_json(
            result_file,
            {
                "status": "skipped",
                "summary": "OPENAI_API_KEY is missing.",
                "commit_message": "",
                "notes": "Add the OPENAI_API_KEY GitHub secret to enable the remote coder workflow.",
                "changed_files": [],
                "check_output": "",
            },
        )
        return 0

    feedback: str | None = None
    last_summary = ""
    last_notes = ""
    last_commit_message = ""
    last_check_output = ""

    for _ in range(max(args.attempts, 1)):
        repo_context = build_repo_context(repo)
        result = call_remote_coder(
            api_key=api_key,
            model=model,
            reasoning_effort=reasoning_effort,
            task=args.task,
            repo_context=repo_context,
            feedback=feedback,
        )

        apply_result(repo, result)

        last_summary = result.get("summary", "")
        last_notes = result.get("notes", "")
        last_commit_message = sanitize_commit_message(result.get("commit_message", ""))

        files = changed_files(repo)
        if not files:
            save_json(
                result_file,
                {
                    "status": "no_changes",
                    "summary": last_summary or "No changes were required.",
                    "commit_message": last_commit_message,
                    "notes": last_notes,
                    "changed_files": [],
                    "check_output": "",
                },
            )
            return 0

        ok, output = run_check_command(repo, check_command)
        last_check_output = tail_lines(output)

        if ok:
            save_json(
                result_file,
                {
                    "status": "success",
                    "summary": last_summary,
                    "commit_message": last_commit_message,
                    "notes": last_notes,
                    "changed_files": files,
                    "check_output": last_check_output,
                },
            )
            return 0

        feedback = (
            "Automated checks failed after the previous patch.\n\n"
            f"Command: {check_command}\n\n"
            f"Output:\n{last_check_output}"
        )

    save_json(
        result_file,
        {
            "status": "failed",
            "summary": last_summary or "Remote coder could not produce a passing change.",
            "commit_message": last_commit_message,
            "notes": last_notes or "The repository did not pass automated checks.",
            "changed_files": changed_files(repo),
            "check_output": last_check_output,
        },
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
