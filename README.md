# SoloDB React Components

Reusable React components, providers, and hooks for building SoloDB-powered applications. This package extracts common UI and state-management pieces (dashboards, headers, flows, and contexts) into a shareable library.

## Features

- Ready-to-use dashboards and UI elements for Equipment, Monitor, Run, Chemical, Admin, and Service modules
- Context providers and hooks for authentication and domain state
- Lightweight runtime configuration via `initSolodbComponents`
- TypeScript types exported for key domain entities
- Example app included for local development and integration testing

## Installation

```bash
yarn add solodb-react-components
# or
npm install solodb-react-components
```

### Peer dependencies

This library relies on the following peer dependencies in your app:

- react (18 or 19) and react-dom (18 or 19)
- @tanstack/react-query ~5.90
- @tanstack/react-table ^8
- axios ^1.13
- moment ^2.30 and moment-timezone ^0.6
- react-router-dom ^7
- react-bootstrap ^2
- react-hook-form ^7
- qrcode.react ^4
- react-google-charts ^5
- react-intersection-observer ^10
- react-markdown ^10
- react-dropzone ^14
- react-select ^5
- yet-another-react-lightbox ^3

Ensure these are installed in your application. Refer to `package.json` for the full list and exact versions.

## Quick start

1) Configure the library at app startup (optional but recommended):

```ts
import { initSolodbComponents } from "solodb-react-components";

initSolodbComponents({
  // example: baseUrl, feature flags, timezone, etc.
});
```

2) Wrap your app with the required providers (e.g., `AuthProvider`). Use additional domain providers as needed:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, EquipmentProvider } from "solodb-react-components";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <EquipmentProvider>
          <BrowserRouter>
            {/* your routes/components */}
          </BrowserRouter>
        </EquipmentProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

## Exports overview

All exports are available from the package root (`solodb-react-components`):

- Providers: `AuthProvider`, `EquipmentProvider`, `StatusMailProvider`, `MonitorProvider`, `RunProvider`, `RunStepProvider`, `EmphasizedParametersProvider`
- Components (selection):
  - Equipment: `SetupUpdateEquipment`, `GoldsteinEquipmentDashboard`, `StatusMailComponent`, `EquipmentDashboard`, `EquipmentHeaderElement`
  - Monitor: `MonitorCard`, `MonitorPage`, `MonitorHeaderElement`
  - Run: `RunHeaderElement`, `RunStepsElement`, `RunInformationElement`, `RunStepHeaderElement`, `RunStepExecuteElement`
  - Chemical: `ChemicalHeaderElement`, `ChemicalIntakeElement`
  - Admin: `GoldsteinClientsDashboard`
  - Service: `ReportResults`
  - Partials: `PaginationLinks`, `InputModal`, `DateFormat`
- Contexts: `AuthContext`, `EquipmentContext`, `StatusMailContext`, `MonitorContext`, `RunContext`, `RunStepContext`, `EmphasizedParametersContext`
- Hooks: `useAuth`
- Runtime: `initSolodbComponents`
- Types: `User`, `Equipment`, `Monitor`, `Run`, `RunStep`

For the complete and up‑to‑date list, see `src/index.ts`.

## Example application

This repository includes an example app showing typical integration.

Run it locally:

```bash
# 1) Install and build the library
yarn install
yarn build

# 2) Install and run the example
yarn run example:install
yarn dev
```