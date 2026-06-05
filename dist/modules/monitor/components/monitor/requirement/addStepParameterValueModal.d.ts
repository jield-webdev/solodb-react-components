import { default as React } from 'react';
import { MonitorRequirement, MonitorMeasurementResult } from '@jield/solodb-typescript-core';
declare const AddStepParameterValueModal: ({ requirement, result, refetchMonitorStepParameterValues, }: {
    requirement: MonitorRequirement;
    result: MonitorMeasurementResult;
    refetchMonitorStepParameterValues: () => void;
}) => React.JSX.Element;
export default AddStepParameterValueModal;
