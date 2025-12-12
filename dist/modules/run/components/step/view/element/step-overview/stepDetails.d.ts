import { RunStep } from '../../../../../interfaces/runStep';
import { Run } from '../../../../../interfaces/run';
declare const StepDetails: ({ run, runStep, showOnlyEmphasizedParameters, }: {
    run: Run;
    runStep: RunStep;
    showOnlyEmphasizedParameters: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export default StepDetails;
