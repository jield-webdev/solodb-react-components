import React from "react";
import ReactDOM from "react-dom/client";
import PageRoutes from "./routes/pageRoutes";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "solodb-react-components";
import { GoldsteinDataProvider } from "goldstein-client-dashboard";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <GoldsteinDataProvider
            defaultData={{
              goldsteinFQDN: "",
              associationType: "",
              associationID: 0,
            }}
          >
            <PageRoutes />
            {import.meta.env.DEV && <ReactQueryDevtools />}
          </GoldsteinDataProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
