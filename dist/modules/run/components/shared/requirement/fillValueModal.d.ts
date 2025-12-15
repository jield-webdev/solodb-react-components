import { Requirement } from '../../../interfaces/requirement';
import { RunPart } from '../../../interfaces/run/runPart';
import { RunStepPart } from '../../../interfaces/step/runStepPart';
import { MeasurementResult } from '../../../interfaces/measurement/result';
export declare const FillValueModal: ({ requirement, result, show, setShow, refetchFn, part, stepPart, }: {
    requirement: Requirement;
    result?: MeasurementResult;
    show: boolean;
    setShow: (set: boolean) => void;
    refetchFn: (keys: any) => void;
    part?: RunPart;
    stepPart?: RunStepPart;
}) => import("react/jsx-runtime").JSX.Element;
