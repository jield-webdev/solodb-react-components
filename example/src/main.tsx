import React from "react";
import ReactDOM from "react-dom/client";
import PageRoutes from "./routes/pageRoutes";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, initSolodbComponents } from "solodb-react-components";
const queryClient = new QueryClient();

// Initialize library runtime configuration
initSolodbComponents({
  serverUri: import.meta.env.PROD ? "" : "https://solodb-onelab.docker.localhost",
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <PageRoutes />
            {import.meta.env.DEV && <ReactQueryDevtools />}
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
