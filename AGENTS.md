# AGENTS.md

## Project Overview

- This repository publishes `@jield/solodb-react-components`, a reusable React component library for SoloDB apps.
- Source code lives in `src/`, and the distributable package is built into `dist/`.
- `example/` is a local consumer app used to validate integrations against the library.

## Setup and Development Commands

- Install dependencies: `yarn install`
- Install example app dependencies: `yarn example:install`
- Build library (TypeScript + Vite library build): `yarn build`
- Start example app in dev mode: `yarn dev`
- Run tests: `yarn test`
- Run tests in watch mode: `yarn test:watch`
- Generate coverage report: `yarn coverage`

## Expected Validation Before Finalizing Changes

- Run at least `yarn test` and `yarn build` before finishing.
- If behavior changes, add or update tests near the affected domain code.
- Use the example app (`yarn dev`) to manually verify UI/interaction changes.

## Architecture Map

- `src/index.ts`: package entrypoint; controls all public exports.
- `src/modules/core/`: auth provider/context/hooks, shared primitives, runtime config.
- `src/modules/equipment/`, `src/modules/monitor/`, `src/modules/run/`, `src/modules/chemical/`, `src/modules/admin/`, `src/modules/service/`: domain modules.
- `src/modules/partial/`: shared cross-domain UI components.
- `src/utils/`: general utility helpers and tests.
- `src/style/`: package-level styles.
- `example/src/`: integration harness that consumes this package.

## Public API and Export Rules

- Any new consumer-facing component, provider, hook, or type must be exported from `src/index.ts`.
- Keep export names stable unless a breaking change is explicitly requested.
- Preserve peer dependency boundaries (React, React DOM, React Router, TanStack Query/Table, axios) so they remain external to the library bundle.

## Runtime Configuration Rules

- Runtime server configuration is centralized in `src/modules/core/config/runtimeConfig.ts`.
- Use `initSolodbComponents` to configure runtime values.
- If `getServerUri` behavior changes, update or add tests to cover it.

## Testing Guidance

- Current tests use Vitest + Testing Library.
- Prefer targeted tests for hooks, utils, and stateful component behavior.

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
