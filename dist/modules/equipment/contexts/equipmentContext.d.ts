import { Equipment } from '../interfaces/equipment';
interface EquipmentContext {
    equipment: Equipment;
    reloadEquipment: () => void;
}
export declare const EquipmentContext: import('react').Context<EquipmentContext>;
export {};
