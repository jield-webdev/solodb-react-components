import {
  GoldsteinEquipmentDashboard,
  SetupUpdateEquipment,
  StatusMailComponent,
  StatusMailProvider,
  EquipmentHeaderElement,
  EquipmentDashboard,
  MonitorHeaderElement,
  MonitorPage,
  RunHeaderElement,
  RunInformationElement,
  RunStepsElement,
  EmphasizedParametersProvider,
  RunStepHeaderElement,
  RunStepExecuteElement,
  ChemicalHeaderElement,
  GoldsteinClientsDashboard,
  ReportResults,
} from "@jield/solodb-react-components";
import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

// Route path constants
const ROUTES = {
  BASE: "/:environment",
  OPERATOR: "/:environment/operator",
  EQUIPMENT: {
    BASE: "/:environment/operator/equipment",
    DETAIL: "/:environment/operator/equipment/:id",
    STATUS_MAIL: "/:environment/equipment/statusmail/display/:id.html",
    STATUS_MAIL_OPERATOR: "/:environment/operator/statusmail/display/:id.html",
    SETUP_UPDATE_EQUIPMENT: "/:environment/equipment/setup/update-equipment/:id.html",
  },
  MONITOR: {
    BASE: "/:environment/operator/monitor",
    DETAIL: "/:environment/operator/monitor/:id",
  },
  RUN: {
    BASE: "/:environment/operator/run",
    DETAILS: "/:environment/operator/run/details/:id",
    DETAILS_INFO: "/:environment/operator/run/details/:id/information",
    DETAILS_STEPS: "/:environment/operator/run/details/:id/steps",
    STEP: "/:environment/operator/run/step/:id",
  },
  CHEMICAL: {
    BASE: "/:environment/chemical",
    INTAKE: "/:environment/chemical/intake",
  },
  GOLDSTEIN: {
    DASHBOARD: "/admin/goldstein/dashboard.html",
    EQUIPMENT_DASHBOARD: "/:environment/equipment/details/:id/dashboard.html",
  },
  SERVICE: {
    REPORT_RESULTS: "/:environment/service/event/report/:id/results",
  },
};

// Lazy-loaded components
const ChemicalIntakeElement = lazy(() =>
  import("@jield/solodb-react-components").then((module) => ({ default: module.ChemicalIntakeElement }))
);

// Not Found component
const NotFound = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
    <div className="text-center">
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  </div>
);

/**
 * Main routing component for the example application
 * Demonstrates usage of solodb-react-components library
 */
export default function PageRoutes() {
  return (
    <Routes>
      {/* Equipment routes */}
      <Route path={ROUTES.EQUIPMENT.BASE} element={<EquipmentHeaderElement />}>
        <Route path={ROUTES.EQUIPMENT.DETAIL} element={<EquipmentDashboard />} />
      </Route>

      {/* Monitor routes */}
      <Route path={ROUTES.MONITOR.BASE} element={<MonitorHeaderElement />}>
        <Route path={ROUTES.MONITOR.DETAIL} element={<MonitorPage />} />
      </Route>

      {/* Equipment status mail route */}
      <Route path={ROUTES.BASE + "/equipment"}>
        <Route
          path={ROUTES.EQUIPMENT.STATUS_MAIL}
          element={
            <StatusMailProvider>
              <StatusMailComponent />
            </StatusMailProvider>
          }
        />
        <Route path={ROUTES.EQUIPMENT.SETUP_UPDATE_EQUIPMENT} element={<SetupUpdateEquipment />} />
      </Route>

      {/* Equipment status mail route (operator) */}
      <Route path={ROUTES.OPERATOR}>
        <Route
          path={ROUTES.EQUIPMENT.STATUS_MAIL_OPERATOR}
          element={
            <StatusMailProvider>
              <StatusMailComponent />
            </StatusMailProvider>
          }
        />
      </Route>

      {/* Run routes */}
      <Route path={ROUTES.RUN.BASE}>
        <Route path={ROUTES.RUN.DETAILS} element={<RunHeaderElement />}>
          <Route path={ROUTES.RUN.DETAILS_INFO} element={<RunInformationElement />} />
          <Route
            path={ROUTES.RUN.DETAILS_STEPS}
            element={
              <EmphasizedParametersProvider>
                <RunStepsElement />
              </EmphasizedParametersProvider>
            }
          />
        </Route>
        <Route path={ROUTES.RUN.STEP} element={<RunStepHeaderElement />}>
          <Route index element={<RunStepExecuteElement />} />
        </Route>
      </Route>

      {/* Chemical routes */}
      <Route path={ROUTES.CHEMICAL.BASE}>
        <Route path={ROUTES.CHEMICAL.INTAKE} element={<ChemicalHeaderElement />}>
          <Route index element={<ChemicalIntakeElement />} />
        </Route>
      </Route>

      {/* Goldstein routes */}
      <Route path={ROUTES.GOLDSTEIN.DASHBOARD} element={<GoldsteinClientsDashboard />} />
      <Route path={ROUTES.GOLDSTEIN.EQUIPMENT_DASHBOARD} element={<GoldsteinEquipmentDashboard />} />

      {/*SERVICES*/}
      <Route path={ROUTES.SERVICE.REPORT_RESULTS} element={<ReportResults />} />

      {/* 404 Not Found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
