import React from "react";
import ReactDOM from "react-dom/client";
import PageRoutes from "./routes/pageRoutes";
import { BrowserRouter } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Providers } from "./providers";

void (async () => {
  const { initSolodbComponents } = await import("@jield/solodb-react-components");

  // Initialize library runtime configuration
  initSolodbComponents({
    serverUri: import.meta.env.PROD ? "" : "https://solodb-onelab.docker.localhost",
  });

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Providers
        child={
          <BrowserRouter>
            <PageRoutes />
            {import.meta.env.DEV && <ReactQueryDevtools />}
          </BrowserRouter>
        }
      />
    </React.StrictMode>
  );
})();
