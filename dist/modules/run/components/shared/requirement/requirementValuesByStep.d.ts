import { Requirement, MeasurementResult } from '@jield/solodb-typescript-core';
export default function RequirementValuesByStep({ requirement, measurementResults, refetchFn, editOnly, }: {
    requirement: Requirement;
    measurementResults?: MeasurementResult[];
    refetchFn?: (keys: any[]) => void;
    editOnly?: boolean;
}): import("react/jsx-runtime").JSX.Element;
