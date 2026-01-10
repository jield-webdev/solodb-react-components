export declare function listAssociationItems(serverEndpoint: string): Promise<string[]>;
type AvailableEquipment = {
    id: number;
    mes_name: string;
};
export declare function listAvailableEquipment(serverEndpoint: string): Promise<AvailableEquipment[]>;
export {};
