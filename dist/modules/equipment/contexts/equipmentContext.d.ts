import { Equipment } from '@jield/solodb-typescript-core';
interface EquipmentContext {
    equipment: Equipment;
    reloadEquipment: () => void;
}
export declare const EquipmentContext: import('react').Context<EquipmentContext>;
export {};
