# Remote Coder

This workflow lets GitHub trigger code changes remotely, without keeping the local machine on.

## Triggers

- Pull request comment starting with `/codex`
- Manual GitHub Actions run with `task`, `work_branch`, and `base_branch`
- Scheduled background run every hour at minute `17` UTC when enabled with repository variables

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
- `REMOTE_CODER_SCHEDULED_ENABLED`
- `REMOTE_CODER_SCHEDULED_TASK`
- `REMOTE_CODER_SCHEDULED_BRANCH`
- `REMOTE_CODER_SCHEDULED_BASE`

Recommended defaults:

- model: `gpt-5-codex`
- reasoning: `high`
- check command: `npm run check`
- scheduled enabled: `false`
- scheduled branch: `codex/ux-flow-pass`
- scheduled base: `main`

## Scheduled background mode

By default, scheduled background work is off. The remote coder still works for `/codex ...` pull request comments and manual workflow runs.

Set repository variables only if you want to turn scheduled background work on:

- `REMOTE_CODER_SCHEDULED_ENABLED=true`
- `REMOTE_CODER_SCHEDULED_TASK=현재 브랜치에서 이어서 진행할 구체적인 작업`
- `REMOTE_CODER_SCHEDULED_BRANCH=codex/ux-flow-pass` (optional)
- `REMOTE_CODER_SCHEDULED_BASE=main` (optional)

To stop scheduled background work completely, set:

- `REMOTE_CODER_SCHEDULED_ENABLED=false`

Behavior:

- the workflow wakes up every hour at minute `17` UTC
- it checks out the configured base branch, then switches to the configured work branch
- it runs the remote coder with the scheduled task
- it runs `npm run check`
- it commits and pushes only when checks pass

Constraints:

- scheduled mode never writes directly to `main` or `master`
- the workflow file must exist on the repository default branch for GitHub schedules to run
- use a persistent `codex/...` work branch so changes keep accumulating in one place

## Safety rules in the workflow

- PR comments are accepted only from `OWNER`, `MEMBER`, or `COLLABORATOR`
- direct writes to `main` or `master` are blocked for manual runs
- direct writes to `main` or `master` are blocked for scheduled runs
- changes are pushed only when automated checks pass
