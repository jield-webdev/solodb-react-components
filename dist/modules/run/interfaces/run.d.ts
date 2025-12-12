import { BatchCard } from './run/batchCard';
import { HoldCode } from './run/holdCode';
import { Priority } from './run/priority';
import { Project } from '../../core/interfaces/project';
import { RunStep } from './runStep';
export declare enum RunTypeEnum {
    RESEARCH = 1,
    PRODUCTION = 2
}
export interface Run {
    id: number;
    label: string;
    name: string;
    amount_of_steps: number;
    run_type: RunTypeEnum;
    responsible: string;
    status: string;
    first_unfinished_step?: RunStep;
    last_finished_step?: RunStep;
    has_batch_card: boolean;
    batch_card?: BatchCard;
    hold_code?: HoldCode;
    priority?: Priority;
    project: Project;
    amount_root_parts: number;
    access: {
        edit: boolean;
    };
}
