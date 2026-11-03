# SoloDB React Components

Reusable React components, providers, and hooks for building SoloDB-powered applications. This package extracts common UI and state-management pieces (dashboards, headers, flows, and contexts) into a shareable library.

## Features

- Ready-to-use dashboards and UI elements for Equipment, Monitor, Run, Chemical, Room, Admin, and Service modules
- Context providers and hooks for authentication and domain state
- Lightweight runtime configuration via `initSolodbComponents`
- TypeScript types exported for key domain entities
- Example app included for local development and integration testing

### Peer dependencies

This library relies on the following peer dependencies in your app:

- `react` and `react-dom` (`^19`)
- `@tanstack/react-query` (`^5.90`)
- `@tanstack/react-table` (`^8.21`)
- `axios` (`^1.13.2`)
- `react-router-dom` (`^7.9`)

Ensure these are installed in your application. Refer to `package.json` for the full list and exact versions.

## Quick start

1) Configure the library at app startup (optional but recommended):

```ts
import { initSolodbComponents } from "@jield/solodb-react-components";

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
import { AuthProvider, EquipmentProvider } from "@jield/solodb-react-components";

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

3) Import the library stylesheet through its package export:

```ts
import "@jield/solodb-react-components/style.css";
```

## Exports overview

All JavaScript and TypeScript exports are available from the package root (`@jield/solodb-react-components`):

- Providers: `AuthProvider`, `EquipmentProvider`, `StatusMailProvider`, `MonitorProvider`, `RunProvider`, `RunStepProvider`, `EmphasizedParametersProvider`
- Components (selection):
  - Equipment: `SetupUpdateEquipment`, `GoldsteinEquipmentDashboard`, `StatusMailComponent`, `EquipmentDashboard`, `EquipmentHeaderElement`
  - Monitor: `MonitorCard`, `MonitorPage`, `MonitorHeaderElement`
  - Run: `RunHeaderElement`, `RunStepsElement`, `RunInformationElement`, `RunStepHeaderElement`, `RunStepExecuteElement`
  - Chemical: `ChemicalHeaderElement`, `ChemicalIntakeElement`
  - Room: `PlaceFloorPlanItems`
  - Admin: `GoldsteinClientsDashboard`
  - Service: `ReportResults`
  - Partials: `PaginationLinks`, `InputModal`, `DateFormat`
- Contexts: `AuthContext`, `EquipmentContext`, `StatusMailContext`, `MonitorContext`, `RunContext`, `RunStepContext`, `EmphasizedParametersContext`
- Hooks: `useAuth`
- Runtime: `initSolodbComponents`
- Types: `User`, `Equipment`, `Monitor`, `Run`, `RunStep`

For the complete and up‑to‑date list, see `src/index.ts`.

## Primilla chat

`PrimillaChatPage` reads the Primilla hostname from `#root`'s
`data-primilla-endpoint` attribute and adds `https://`, following Goldstein's
endpoint convention. Set `data-primilla-endpoint="primilla.docker.localhost"`
to use the development reverse proxy. Requests and attachment downloads use the
SoloDB bearer token from `#root`'s `data-jwt` attribute and omit cookie credentials.
Downloads use attachment filenames directly; they do not need exposed response headers.

Each mounted chat keeps its transcript, attachments and one server conversation ID
in memory. They are cleared when the page unmounts. Requests send only `message`
and, for follow-ups, `conversation_id`; the local transcript is never sent as
history. The ID from the first SSE `conversation` event is committed only after
`done`. An error, an interrupted stream or leaving the page fails the turn; an
unfinished new conversation ID is discarded. Leaving the page aborts its request.
Only successful turns become part of the server's conversation.

The input and retry buttons are disabled during a turn. A 409 conflict retries
automatically once, then offers a manual retry. For a missing conversation (404)
or a conversation that is too long (422), **Start fresh and retry** sends the
failed message without an ID. The earlier transcript stays visible, but Primilla
starts with no earlier context. Conversation ownership follows the exact bearer
token, so a new login can cause a 404 for an earlier conversation.

Failed messages remain visible with a retry action. A 401 asks the user to sign in
to SoloDB again before retrying; 500, 502, timeouts (including nginx HTML 504s)
and interrupted streams offer retry. A 502 also suggests rephrasing the message.
Invalid requests (400) show the validation error without a retry action. Text,
tool and attachment events are accepted only from an SSE response, and a stream
must end with `done` to succeed.

Attachments stay attached to the turn that produced them. Downloads require the
same bearer token; older links may fail after a new login. A later report with
the same filename replaces the file behind its earlier URL.

## Example application

This repository includes an example app showing typical integration.

For repository development, `@jield/solodb-typescript-core` is linked from `../solodb-typescript-core`. Keep that repository checked out alongside this one before installing dependencies.

Run it locally:

```bash
# 1) Install and build the library
yarn install
yarn build

# 2) Install and run the example
yarn run example:install
yarn dev
```

## Release

Run the guided release script from the repository root:

```bash
yarn release
```

The script starts from `develop`, upgrades dependencies, shows the resulting changes, prompts for the next package version, optionally runs tests and a build, commits the release on `develop`, merges it into `main`, pushes `main`, creates an annotated `vX.Y.Z` tag on `main`, pushes the tag to GitHub, and switches back to `develop`.
