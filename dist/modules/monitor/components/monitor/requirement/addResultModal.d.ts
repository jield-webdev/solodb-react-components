import { MonitorRequirementTarget } from '../../../interfaces/requirement/monitorRequirementTarget';
import { MonitorRequirement } from '../../../interfaces/monitorRequirement';
declare const AddResultModal: ({ requirement, targets, refetchResults, }: {
    requirement: MonitorRequirement;
    targets: MonitorRequirementTarget[];
    refetchResults: () => void;
}) => import("react/jsx-runtime").JSX.Element;
export default AddResultModal;
