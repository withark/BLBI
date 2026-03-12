# BLBI

Remote-ready Next.js workspace for the BLBI MVP.

## Codespaces

1. Open the repository on GitHub.
2. Switch to the branch you want to work on.
3. Start a new Codespace.
4. Wait for `npm install` to finish in the devcontainer.
5. Run `npm run dev`.

The app listens on port `3000` and is configured for forwarded preview access.

## GitHub Actions

- `CI` runs automatically on pushes to `main` and `codex/**` branches.
- The workflow also runs on pull requests and can be started manually with `workflow_dispatch`.
- Remote checks run `npm ci`, `npm run typecheck`, and `npm run build`.
- `Auto PR` opens or updates a pull request from `codex/**` branches into `main`.
- `Nightly Check` runs every day at `03:00` Korea time (`18:00 UTC`) and can also be triggered manually.
- `Preview Vercel` deploys preview builds for `codex/**` pushes and pull requests, then comments the preview URL on the PR.
- `Deploy Vercel` runs on pushes to `main` only when the repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are configured.
- `Remote Coder` can apply code changes from a PR comment or manual dispatch, then push the result back to the working branch after checks pass.
- Deployment secret setup is documented in [docs/DEPLOYMENT_SETUP.md](docs/DEPLOYMENT_SETUP.md).
- Remote coding workflow usage is documented in [docs/REMOTE_CODER.md](docs/REMOTE_CODER.md).

This means both validation and scoped remote coding can continue on GitHub even after the local machine is off.

## Local

```bash
npm install
npm run dev
```
