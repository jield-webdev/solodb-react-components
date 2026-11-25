# AGENTS.md

## Project Overview

- This repository publishes `@jield/solodb-react-components`, a reusable React component library for SoloDB apps.
- Source code lives in `src/`, and the distributable package is built into `dist/`.
- `example/` is a local consumer app used to validate integrations against the library.

## Setup and Development Commands

- Install dependencies: `yarn install`
- The package links `@jield/solodb-typescript-core` from `../solodb-typescript-core`; keep that sibling checkout available before installing dependencies.
- Install example app dependencies: `yarn example:install`
- Build library (TypeScript + Vite library build): `yarn build`
- Start example app in dev mode: `yarn dev`
- Run tests: `yarn test`
- Run tests in watch mode: `yarn test:watch`
- Generate coverage report: `yarn coverage`
- Run guided release flow: `yarn release`
- Deployment is documented in `README.md`. `.github/workflows/publish.yaml` tests, builds, and publishes on `v*` tag pushes or manual runs. Tags must match the committed package version; stable versions publish under `latest`, and all prereleases publish under `beta`.
- For a branch preview, manually run `Publish Package` on the desired branch with a unique prerelease `version` input (for example `1.3.3-beta.0`). The version changes only in CI; no commit, tag, or merge is created. Manual runs reject stable versions. Publishing uses npm trusted publishing (OIDC).

## Architecture Map

- `src/index.ts`: package entrypoint; controls all public exports.
- `src/modules/core/`: auth provider/context/hooks, shared primitives, runtime config.
- `src/modules/primilla/` (AI chat page, SSE streaming hook), `src/modules/equipment/`, `src/modules/monitor/`, `src/modules/run/`, `src/modules/chemical/`, `src/modules/room/`, `src/modules/admin/`, `src/modules/service/`: domain modules.
- `src/modules/partial/`: shared cross-domain UI components.
- `src/utils/`: general utility helpers and tests.
- `src/style/`: package-level styles.
- `example/src/`: integration harness that consumes this package.
- Run layout extra trays are explicitly created and managed across the run. Tray mutations use `create/run/tray`, `update/run/tray/{id}`, and `delete/run/tray/{id}`; the PHP API must reject removal of trays referenced by any part or step.
- The new-run wizard derives the run's experimental split from the sum of selected parent-part amounts (default 1 each). Show this total read-only with an edit/back action; preserve details when editing parents. Keep a manual split when no parent parts are selected. For parent-based runs send `parts: 0` to `create/run` (requires PHP support for zero initial parts), then await each `create/run/parent` request sequentially; parent linking creates the split parts and updates the total. On successful creation and linking, use full browser navigation to the information page on the configured SoloDB server.
- Parent-run searches must call `listRuns` with `query`, preserving `environment` and `availableAsParentForRun`. Load suggestions and search results in pages of 50, fetching the next page on menu scroll using `hasMore` and `currentPage`; keep pages scoped to the search query.

## Public API and Export Rules

- Any new consumer-facing component, provider, hook, or type must be exported from `src/index.ts`.
- Keep export names stable unless a breaking change is explicitly requested.
- Consumer apps must import `@jield/solodb-react-components/style.css` for the generated library stylesheet.
- Preserve peer dependency boundaries (React, React DOM, React Router, TanStack Query/Table, axios) so they remain external to the library bundle.

## Runtime Configuration Rules

- Runtime server configuration is centralized in `src/modules/core/config/runtimeConfig.ts`.
- Use `initSolodbComponents` to configure runtime values.
- If `getServerUri` behavior changes, update or add tests to cover it.

## Testing Guidance

- Current tests use Vitest + Testing Library.
- Prefer targeted tests for hooks, utils, and stateful component behavior.

## Primilla Client Rules

- Read the Primilla hostname from `#root`'s `data-primilla-endpoint` attribute and prepend `https://`, matching Goldstein's endpoint convention. For development, set it to `primilla.docker.localhost` to use the reverse proxy; preserve bearer authentication and omit cookie credentials.
- Send only `message` and optional `conversation_id`. Never send the local transcript as `history`.
- Keep one server conversation ID per mounted chat, alongside its in-memory transcript. Accept the first SSE `conversation` event provisionally and commit its ID only after `done`.
- Check HTTP errors and the SSE content type before reading events. Treat streams without `done` or `error` as failed and discard provisional IDs on failure.
- Allow one active turn per chat, including retries, and abort it on unmount.
- Retry 409 once automatically. Require the explicit **Start fresh and retry** action for failed 404/422 turns; preserve the transcript while dropping server context.
- Do not retry 400 automatically or offer its retry action. For 401, ask the user to sign in again; offer retries for server/model errors, timeouts and interrupted streams.
- Keep attachments with their original successful turn; use authenticated downloads and the attachment's filename.
- Cover conversation lifecycle, recovery, strict request fields and fragmented/interrupted streams in the Primilla hook and stream tests.

## Code Style and Scope

- TypeScript strict mode is enabled; avoid `any` unless unavoidable.
- Follow existing style conventions (Prettier: double quotes, semicolons, trailing commas).
- Keep diffs focused; avoid unrelated formatting churn.
- Do not edit generated/build artifacts (`dist/`, coverage output, `node_modules/`).

## Security and Secrets

- Never commit secrets, credentials, or real tokens.
- Treat values in `example/.env` as sensitive (for example `VITE_JWT_TOKEN`).
- Avoid logging auth tokens or other sensitive identifiers.

## Performance Optimization

### Code Splitting
```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Memory Optimization
```tsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  const handleUpdate = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleUpdate(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```

## Documentation Maintenance

- If commands, architecture, runtime behavior, or public exports change, update `README.md` and `AGENTS.md` in the same change.

## Reference Resources

- [React Official Documentation](https://react.dev/)
- [Vite Official Documentation](https://vitejs.dev/)
- [TypeScript Official Documentation](https://www.typescriptlang.org/)
- [React Router Documentation](https://reactrouter.com/)
