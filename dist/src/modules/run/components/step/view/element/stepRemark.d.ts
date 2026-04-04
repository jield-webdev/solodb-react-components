import { RunStep } from '@jield/solodb-typescript-core';
type StepRemarkProps = {
    runStep?: RunStep;
    reloadRunStep?: () => void;
    title?: string;
    titleClassName?: string;
};
export default function StepRemark({ runStep, reloadRunStep, title, titleClassName, }: StepRemarkProps): import("react/jsx-runtime").JSX.Element;
export {};
