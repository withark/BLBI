# Deployment Setup

This project can deploy to Vercel from GitHub Actions after three repository secrets are configured.

## Required GitHub Secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## How to get the values

### 1. Vercel token

- Create a token in the Vercel dashboard.
- Scope it to the account or team that owns the project.

### 2. Org ID and Project ID

Use the Vercel CLI from the project root:

```bash
vercel link
cat .vercel/project.json
```

The linked file contains:

- `orgId`
- `projectId`

## Where to store them

In the GitHub repository:

- `Settings`
- `Secrets and variables`
- `Actions`
- Add the three values as repository secrets

## What happens after setup

- Push to `main` triggers production deploy
- Manual `Deploy Vercel` workflow runs are also enabled
- If a secret is missing, the workflow writes a skip reason to the workflow summary
