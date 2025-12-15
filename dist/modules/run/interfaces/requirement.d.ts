import { RunStep } from './runStep';
import { Target } from './requirement/target';
import { Measurement } from './measurement';
export interface Requirement {
    id: number;
    definition: string;
    step: RunStep;
    requirement_for_step: RunStep | null;
    targets: Target[];
    measurement: Measurement;
}
