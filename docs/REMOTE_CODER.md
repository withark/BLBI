# Remote Coder

This workflow lets GitHub trigger code changes remotely, without keeping the local machine on.

## Triggers

- Pull request comment starting with `/codex`
- Manual GitHub Actions run with `task`, `work_branch`, and `base_branch`

## Recommended usage

1. Push or open a `codex/...` branch
2. Open a pull request to `main`
3. Add a PR comment like:

```text
/codex 대시보드 생성 버튼 아래에 최근 추천 키워드 섹션을 더 단순하게 정리해줘
```

The workflow will:

- check out the branch remotely
- call the OpenAI API
- apply repository edits
- run `npm run check`
- commit and push passing changes
- post a result comment back to the PR

## Required GitHub secrets

- `OPENAI_API_KEY`

## Recommended GitHub secrets

- `REMOTE_CODER_GIT_TOKEN`

Use a PAT with repository and workflow write permissions if you want downstream workflows triggered by remote coder pushes.

Without `REMOTE_CODER_GIT_TOKEN`, the workflow falls back to `GITHUB_TOKEN`, which can push changes but may not trigger other workflows on the resulting commit.

## Optional GitHub variables

- `OPENAI_REMOTE_CODER_MODEL`
- `OPENAI_REMOTE_CODER_REASONING`
- `REMOTE_CODER_CHECK_COMMAND`

Recommended defaults:

- model: `gpt-5.3-codex`
- reasoning: `high`
- check command: `npm run check`

## Safety rules in the workflow

- PR comments are accepted only from `OWNER`, `MEMBER`, or `COLLABORATOR`
- direct writes to `main` or `master` are blocked for manual runs
- changes are pushed only when automated checks pass
