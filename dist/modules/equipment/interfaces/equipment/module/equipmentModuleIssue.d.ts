import { User } from '../../../../core/interfaces/user';
export declare enum EquipmentModuleIssueType {
    DEFAULT = 1,
    PRIORITY = 2,
    ESCALATION = 3
}
export declare enum EquipmentModuleIssueStatus {
    ACTIVE = 1,
    CLOSED = 2
}
export interface EquipmentModuleIssue {
    id: number;
    module_id: number;
    date_created: string;
    date_closed?: string;
    last_update?: string;
    issue: string;
    description: string;
    issue_type: EquipmentModuleIssueType;
    status: EquipmentModuleIssueStatus;
    owner: User;
    updated_by?: User;
    forecast_up: string;
    actions: string;
    attachments: number;
}
