// Core Providers
export { AuthProvider } from "@jield/solodb-react-components/modules/core/providers/authProvider";

// Equipment Components
export { default as SetupUpdateEquipment } from "@jield/solodb-react-components/modules/equipment/components/setupUpdateEquipment";
export { default as GoldsteinEquipmentDashboard } from "@jield/solodb-react-components/modules/equipment/components/goldsteinEquipmentDashboard";
export { default as StatusMailComponent } from "@jield/solodb-react-components/modules/equipment/components/statusMailComponent";
export { default as EquipmentDashboard } from "@jield/solodb-react-components/modules/equipment/components/dashboard/equipmentDashboard";
export { default as EquipmentHeaderElement } from "@jield/solodb-react-components/modules/equipment/components/equipmentHeaderElement";
export { default as ModuleStatusElement } from "@jield/solodb-react-components/modules/equipment/components/partial/moduleStatusElement";

// Equipment Providers
export { default as EquipmentProvider } from "@jield/solodb-react-components/modules/equipment/providers/equipmentProvider";
export { default as StatusMailProvider } from "@jield/solodb-react-components/modules/equipment/providers/statusMailProvider";

// Monitor Components
export { default as MonitorCard } from "@jield/solodb-react-components/modules/monitor/components/monitor/monitorCard";
export { default as MonitorPage } from "@jield/solodb-react-components/modules/monitor/components/monitor/monitorPage";
export { default as MonitorHeaderElement } from "@jield/solodb-react-components/modules/monitor/components/monitor/monitorHeaderElement";

// Monitor Providers
export { default as MonitorProvider } from "@jield/solodb-react-components/modules/monitor/providers/monitorProvider";

// Run Components
export { default as RunHeaderElement } from "@jield/solodb-react-components/modules/run/components/run/runHeaderElement";
export { default as RunStepsElement } from "@jield/solodb-react-components/modules/run/components/run/steps/runStepsElement";
export { default as RunInformationElement } from "@jield/solodb-react-components/modules/run/components/run/steps/runInformationElement";
export { default as RunStepHeaderElement } from "@jield/solodb-react-components/modules/run/components/step/runStepHeaderElement";
export { default as RunStepExecuteElement } from "@jield/solodb-react-components/modules/run/components/step/view/runStepExecuteElement";
export { default as StepDetails } from "@jield/solodb-react-components/modules/run/components/run/steps/element/stepDetails";
export { default as RunStepChecklist } from "@jield/solodb-react-components/modules/run/components/step/view/element/runStepChecklist";
export { default as RunStepExecuteMinimal } from "@jield/solodb-react-components/modules/run/components/step/view/runStepExecuteMinimal";
export { default as BatchCardElement } from "@jield/solodb-react-components/modules/run/components/step/view/element/batchCardElement";
export { default as SelectRunWithQrScanner } from "@jield/solodb-react-components/modules/run/components/shared/qr-scanner/selectRunWithQrScanner";


// Run Providers
export { default as RunProvider } from "@jield/solodb-react-components/modules/run/providers/runProvider";
export { default as RunStepProvider } from "@jield/solodb-react-components/modules/run/providers/runStepProvider";
export { default as EmphasizedParametersProvider } from "@jield/solodb-react-components/modules/run/providers/emphasizedParametersProvider";

// Chemical Components
export { default as ChemicalHeaderElement } from "@jield/solodb-react-components/modules/chemical/components/chemicalHeaderElement";
export { default as ChemicalIntakeElement } from "@jield/solodb-react-components/modules/chemical/components/chemical/chemicalIntakeElement";

// Admin Components
export { default as GoldsteinClientsDashboard } from "@jield/solodb-react-components/modules/admin/components/goldsteinClientsDashboard";

// Service Components
export { default as ReportResults } from "@jield/solodb-react-components/modules/service/components/ReportResult";

// Partial Components
export { default as PaginationLinks } from "@jield/solodb-react-components/modules/partial/paginationLinks";
export { default as InputModal } from "@jield/solodb-react-components/modules/partial/modal";
export { default as DateFormat } from "@jield/solodb-react-components/modules/partial/dateFormat";

// Contexts
export { AuthContext } from "@jield/solodb-react-components/modules/core/contexts/authContext";
export { EquipmentContext } from "@jield/solodb-react-components/modules/equipment/contexts/equipmentContext";
export { StatusMailContext } from "@jield/solodb-react-components/modules/equipment/contexts/statusMailContext";
export { MonitorContext } from "@jield/solodb-react-components/modules/monitor/contexts/monitorContext";
export { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
export { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
export { EmphasizedParametersContext } from "@jield/solodb-react-components/modules/run/contexts/emphasizedParametersContext";

// Hooks
export { useAuth } from "@jield/solodb-react-components/modules/core/hooks/useAuth";

// Runtime configuration
export { initSolodbComponents } from "@jield/solodb-react-components/modules/core/config/runtimeConfig";

// Types/Interfaces - Export key interfaces that consumers might need
export type { User, Equipment, Monitor, Run, RunStep } from "@jield/solodb-typescript-core";

import "./style/main.css"
