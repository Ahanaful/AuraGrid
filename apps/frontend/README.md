# AuraGrid Frontend

Next.js App Router interface for AuraGrid. Provides the marketing landing page, Clerk auth flow, and the carbon-aware scheduling dashboard.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

Set Clerk environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) and, if the Worker is deployed separately, `NEXT_PUBLIC_WORKER_BASE_URL`.

## Structure

- `src/app/(marketing)` – public landing page.
- `src/app/(auth)` – Clerk sign-in/sign-up routes.
- `src/app/app` – protected dashboard.
- `src/components` – UI primitives, charts, cards, auth wrappers.
- `src/hooks/useAuraApi.ts` – orchestrates Worker calls and view state.
- `src/services/auragrid.ts` – fetch helpers for Worker API.
- `src/types/api.ts` – shared DTOs mirrored from the Worker.
