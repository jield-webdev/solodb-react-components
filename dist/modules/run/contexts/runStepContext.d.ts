import { ModalProperties } from '../../core/interfaces/modalProperties';
import { RunStep, Run } from 'solodb-typescript-core';
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
