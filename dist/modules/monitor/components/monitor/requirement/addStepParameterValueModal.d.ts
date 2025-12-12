import { MonitorRequirement } from '../../../interfaces/monitorRequirement';
import { MonitorMeasurementResult } from '../../../interfaces/measurement/monitorMeasurementResult';
declare const AddStepParameterValueModal: ({ requirement, result, refetchMonitorStepParameterValues, }: {
    requirement: MonitorRequirement;
    result: MonitorMeasurementResult;
    refetchMonitorStepParameterValues: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default AddStepParameterValueModal;
