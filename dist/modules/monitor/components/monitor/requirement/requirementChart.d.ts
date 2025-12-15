import { MonitorRequirementTarget } from '../../../interfaces/requirement/monitorRequirementTarget';
import { MonitorMeasurementResult } from '../../../interfaces/measurement/monitorMeasurementResult';
export default function RequirementChart({ target, results, }: {
    target: MonitorRequirementTarget;
    results: MonitorMeasurementResult[];
}): import("react/jsx-runtime").JSX.Element;
