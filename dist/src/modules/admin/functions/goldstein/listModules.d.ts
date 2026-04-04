type Status = {
    id: number;
    status: string;
    front_color: string;
    back_color: string;
    sequence: number;
};
type ModuleStatus = {
    id: number;
    status: Status;
    description: string;
};
type ModuleType = {
    id: number;
    type: string;
    is_main_tool: boolean;
};
type Equipment = {
    id: number;
    name: string;
    number: string;
    mes_name: string;
    active: boolean;
    active_in_mes: boolean;
    main_tool_module_id: number;
    main_tool_latest_status_id: number;
};
export type Module = {
    id: number;
    name: string;
    mes_name: string;
    active: boolean;
    equipment: Equipment;
    type: ModuleType;
    latest_module_status: ModuleStatus;
};
export declare function listGoldsteinEquipmentModules(serverEndpoint: string, equipmentID: number): Promise<Module[]>;
export {};
