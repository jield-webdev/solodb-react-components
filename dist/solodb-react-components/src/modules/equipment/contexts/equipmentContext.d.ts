import { Equipment } from '../../../../../solodb-typescript-core/src/index.ts';
interface EquipmentContext {
    equipment: Equipment;
    reloadEquipment: () => void;
}
export declare const EquipmentContext: import('react').Context<EquipmentContext>;
export {};
