import GoldsteinEquipmentDashboard from "@/modules/equipment/components/goldsteinEquipmentDashboard";
import SetupUpdateEquipment from "@/modules/equipment/components/setupUpdateEquipment";
import EmphasizedParametersProvider from "@/modules/run/providers/emphasizedParametersProvider";
import React, { lazy } from "react";
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
const RunStepsElement = lazy(() => import("@/modules/run/components/run/steps/runStepsElement"));
const RunHeaderElement = lazy(() => import("@/modules/run/components/run/runHeaderElement"));
const RunStepHeaderElement = lazy(() => import("@/modules/run/components/step/runStepHeaderElement"));
const RunStepExecuteElement = lazy(() => import("@/modules/run/components/step/view/runStepExecuteElement"));
const EquipmentHeaderElement = lazy(() => import("@/modules/equipment/components/equipmentHeaderElement"));
const EquipmentDashboard = lazy(() => import("@/modules/equipment/components/dashboard/equipmentDashboard"));
const MonitorPage = lazy(() => import("@/modules/monitor/components/monitor/monitorPage"));
const RunInformationElement = lazy(() => import("@/modules/run/components/run/steps/runInformationElement"));
const MonitorHeaderElement = lazy(() => import("@/modules/monitor/components/monitor/monitorHeaderElement"));
const ChemicalHeaderElement = lazy(() => import("@/modules/chemical/components/chemicalHeaderElement"));
const ChemicalIntakeElement = lazy(() => import("@/modules/chemical/components/chemical/chemicalIntakeElement"));
const StatusMailComponent = lazy(() => import("@/modules/equipment/components/statusMailComponent"));
const StatusMailProvider = lazy(() => import("@/modules/equipment/providers/statusMailProvider"));
const GoldsteinClientDashboard = lazy(() => import("@/modules/admin/components/goldsteinClientsDashboard"));
const ReportResults = lazy(() => import("@/modules/service/components/ReportResult"));

// Not Found component
const NotFound = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
    <div className="text-center">
      <h2>404 - Page Not Found xxx</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  </div>
);

/**
 * Main routing component for the application
 * Defines all routes and their corresponding components
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
      <Route path={ROUTES.GOLDSTEIN.DASHBOARD} element={<GoldsteinClientDashboard />} />
      <Route path={ROUTES.GOLDSTEIN.EQUIPMENT_DASHBOARD} element={<GoldsteinEquipmentDashboard />} />

      {/*SERVICES*/}
      <Route path={ROUTES.SERVICE.REPORT_RESULTS} element={<ReportResults />} />

      {/* 404 Not Found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
