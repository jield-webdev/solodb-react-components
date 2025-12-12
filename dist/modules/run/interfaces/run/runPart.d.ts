export interface RunPart {
    id: number;
    short_label: string;
    label: string;
    parsed_label: string;
    part_level: number;
    root_id?: number;
    left: number;
    parent?: RunPart;
}
