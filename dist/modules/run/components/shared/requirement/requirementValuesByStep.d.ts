import { MeasurementResult } from '../../../interfaces/measurement/result';
import { Requirement } from '../../../interfaces/requirement';
export default function RequirementValuesByStep({ requirement, measurementResults, refetchFn, editOnly, }: {
    requirement: Requirement;
    measurementResults?: MeasurementResult[];
    refetchFn?: (keys: any[]) => void;
    editOnly?: boolean;
}): import("react/jsx-runtime").JSX.Element;
