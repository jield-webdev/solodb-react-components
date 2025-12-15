export interface ValuesMap {
    [key: string]: string;
}
export interface ServiceReportCriterion {
    id: number;
    criterion: string;
    help_block: string;
    input_type: "action" | "bool" | "string" | "integer" | "text" | "float" | "select" | "radio" | "checkbox" | "date";
    values: ValuesMap;
    background_color: string;
    has_background_color: boolean;
    date_created: string;
    last_update: string | null;
    archived: boolean;
}
