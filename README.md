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

This means validation can continue on GitHub even after the local machine is off, but actual coding work is still separate from CI.

## Local

```bash
npm install
npm run dev
```
