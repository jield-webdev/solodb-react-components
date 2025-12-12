import { RunStep } from '../runStep';
import { RunStepChecklistItem } from '../step/runStepChecklistItem';
import { User } from '../../../core/interfaces/user';
export interface Changelog {
    id: number;
    date_created: string;
    user: User;
    message: string;
    type: string;
    source: string;
    steps: RunStep[];
    checklist: RunStepChecklistItem[];
}
