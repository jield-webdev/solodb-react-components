// Core Providers
export { AuthProvider } from "@/modules/core/providers/authProvider";

// Equipment Components
export { default as SetupUpdateEquipment } from "@/modules/equipment/components/setupUpdateEquipment";
export { default as GoldsteinEquipmentDashboard } from "@/modules/equipment/components/goldsteinEquipmentDashboard";
export { default as StatusMailComponent } from "@/modules/equipment/components/statusMailComponent";
export { default as EquipmentDashboard } from "@/modules/equipment/components/dashboard/equipmentDashboard";
export { default as EquipmentHeaderElement } from "@/modules/equipment/components/equipmentHeaderElement";

// Equipment Providers
export { default as EquipmentProvider } from "@/modules/equipment/providers/equipmentProvider";
export { default as StatusMailProvider } from "@/modules/equipment/providers/statusMailProvider";

// Monitor Components
export { default as MonitorCard } from "@/modules/monitor/components/monitor/monitorCard";
export { default as MonitorPage } from "@/modules/monitor/components/monitor/monitorPage";
export { default as MonitorHeaderElement } from "@/modules/monitor/components/monitor/monitorHeaderElement";

// Monitor Providers
export { default as MonitorProvider } from "@/modules/monitor/providers/monitorProvider";

// Run Components
export { default as RunHeaderElement } from "@/modules/run/components/run/runHeaderElement";
export { default as RunStepsElement } from "@/modules/run/components/run/steps/runStepsElement";
export { default as RunInformationElement } from "@/modules/run/components/run/steps/runInformationElement";
export { default as RunStepHeaderElement } from "@/modules/run/components/step/runStepHeaderElement";
export { default as RunStepExecuteElement } from "@/modules/run/components/step/view/runStepExecuteElement";

// Run Providers
export { default as RunProvider } from "@/modules/run/providers/runProvider";
export { default as RunStepProvider } from "@/modules/run/providers/runStepProvider";
export { default as EmphasizedParametersProvider } from "@/modules/run/providers/emphasizedParametersProvider";

// Chemical Components
export { default as ChemicalHeaderElement } from "@/modules/chemical/components/chemicalHeaderElement";
export { default as ChemicalIntakeElement } from "@/modules/chemical/components/chemical/chemicalIntakeElement";

// Admin Components
export { default as GoldsteinClientsDashboard } from "@/modules/admin/components/goldsteinClientsDashboard";

// Service Components
export { default as ReportResults } from "@/modules/service/components/ReportResult";

// Partial Components
export { default as PaginationLinks } from "@/modules/partial/paginationLinks";
export { default as InputModal } from "@/modules/partial/modal";
export { default as DateFormat } from "@/modules/partial/dateFormat";

// Contexts
export { AuthContext } from "@/modules/core/contexts/authContext";
export { EquipmentContext } from "@/modules/equipment/contexts/equipmentContext";
export { StatusMailContext } from "@/modules/equipment/contexts/statusMailContext";
export { MonitorContext } from "@/modules/monitor/contexts/monitorContext";
export { RunContext } from "@/modules/run/contexts/runContext";
export { RunStepContext } from "@/modules/run/contexts/runStepContext";
export { EmphasizedParametersContext } from "@/modules/run/contexts/emphasizedParametersContext";

// Hooks
export { useAuth } from "@/modules/core/hooks/useAuth";

// Runtime configuration
export { initSolodbComponents } from "@/modules/core/config/runtimeConfig";

// Types/Interfaces - Export key interfaces that consumers might need
export type { User, Equipment, Monitor, Run, RunStep } from "@jield/solodb-typescript-core";
