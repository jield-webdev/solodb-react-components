import { User } from '../../core/interfaces/user';
export declare enum ShowIssuesOptionEnum {
    HIDE_ISSUES = 1,
    SHOW_ISSUES = 2,
    COLLAPSE_ISSUES = 3
}
export declare enum OrderOptionEnum {
    NAME = 1,
    MES_NAME = 2,
    NUMBER = 3
}
export declare enum ClassificationsOptionEnum {
    AREA = 1,
    AREA_PER_FACILITY = 2,
    ROOM = 3
}
export declare enum DirectionOptionEnum {
    ASC = "ASC",
    DESC = "DESC"
}
export interface StatusMail {
    id: number;
    name: string;
    date_created: string;
    last_updated: string | null;
    filter: {
        messageType: string[];
        MESStatus: string[];
    };
    equipment_filter: string;
    sequence: number;
    show_issues_with_priority: boolean;
    show_in_navigation: boolean;
    show_tool_up: boolean;
    show_issues: ShowIssuesOptionEnum;
    show_reservations: boolean;
    classification: ClassificationsOptionEnum;
    order: OrderOptionEnum;
    direction: DirectionOptionEnum;
    user: User;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
}
