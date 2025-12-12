import { RunStep } from '../interfaces/runStep';
import { ModalProperties } from '../../core/interfaces/modalProperties';
import { Run } from '../interfaces/run';
interface RunStepContext {
    runStep: RunStep;
    setRunStep: (runStep: RunStep) => void;
    reloadRunStep: () => void;
    run: Run;
    modalProperties: ModalProperties;
    setModalProperties: (modalProperties: ModalProperties) => void;
}
export declare const RunStepContext: import('react').Context<RunStepContext>;
export {};
