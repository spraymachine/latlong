# LatLong Web

Next.js app workspace for the LatLong prototype.

## Setup

From the repository root:

```bash
corepack pnpm install
```

## Development

```bash
corepack pnpm --dir apps/web dev
```

## Checks

```bash
corepack pnpm --dir apps/web lint
corepack pnpm --dir apps/web test
corepack pnpm --dir apps/web test:e2e
corepack pnpm --dir apps/web build
```

## Notes

- The app is set up for Vitest and Playwright.
- Playwright tests live in `apps/web/tests`.
- The homepage is intentionally minimal and serves as the shell for later product work.
