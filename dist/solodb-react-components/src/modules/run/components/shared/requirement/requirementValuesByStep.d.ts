import { Requirement, MeasurementResult } from '../../../../../../../solodb-typescript-core/src/index.ts';
export default function RequirementValuesByStep({ requirement, measurementResults, refetchFn, editOnly, }: {
    requirement: Requirement;
    measurementResults?: MeasurementResult[];
    refetchFn?: (keys: any[]) => void;
    editOnly?: boolean;
}): import("react/jsx-runtime").JSX.Element;
