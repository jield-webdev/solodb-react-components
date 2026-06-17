import { default as React } from 'react';
import { MonitorRequirement, MonitorRequirementTarget } from '@jield/solodb-typescript-core';
declare const AddResultModal: ({ requirement, targets, refetchResults, }: {
    requirement: MonitorRequirement;
    targets: MonitorRequirementTarget[];
    refetchResults: () => void;
}) => React.JSX.Element;
export default AddResultModal;
