# SoloDB React Components - Example Application

This is an example application demonstrating how to use the `solodb-react-components` library.

## Setup

1. Build the library first:
   ```bash
   cd ..
   yarn install
   yarn build
   ```

2. Install example dependencies:
   ```bash
   yarn install
   ```

3. Run the development server:
   ```bash
   yarn dev
   ```

The example app will start at `http://localhost:3000` and will consume the components from the parent library using a local link.

## Structure

- `src/main.tsx` - Application entry point with React Query and routing setup
- `src/routes/pageRoutes.tsx` - All application routes using library components
- `index.html` - HTML template with necessary CSS imports

## Usage

This example mirrors the original application structure but imports components from the library:

```tsx
import {
  AuthProvider,
  SetupUpdateEquipment,
  EquipmentDashboard,
  MonitorCard,
  // ... other components
} from "solodb-react-components";
```

## Development Workflow

When developing components in the library:

1. Make changes to the library source code (`../src`)
2. Rebuild the library: `cd .. && yarn build`
3. The example app will automatically reload with the updated components

For faster development, you can run both in watch mode (if configured).
