import { RunStepPartActionEnum } from '../../../enum/runStepPartActionEnum';
export interface RunStepPartAction {
    id: number;
    date_created: string;
    type: {
        id: RunStepPartActionEnum;
        name: string;
    };
    comment: string;
}
