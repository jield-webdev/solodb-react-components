export interface StatusOption {
    id: number;
    status: string;
    front_color: string;
    back_color: string;
}
export declare function listStatusOptions(serverEndpoint: string): Promise<StatusOption[]>;
