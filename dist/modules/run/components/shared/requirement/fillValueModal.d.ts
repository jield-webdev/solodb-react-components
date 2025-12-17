import { Requirement, MeasurementResult, RunPart, RunStepPart } from 'solodb-typescript-core';
export declare const FillValueModal: ({ requirement, result, show, setShow, refetchFn, part, stepPart, }: {
    requirement: Requirement;
    result?: MeasurementResult;
    show: boolean;
    setShow: (set: boolean) => void;
    refetchFn: (keys: any) => void;
    part?: RunPart;
    stepPart?: RunStepPart;
}) => import("react/jsx-runtime").JSX.Element;
