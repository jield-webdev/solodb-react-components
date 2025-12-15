import { Equipment } from '../interfaces/equipment';
export declare const useEquipment: () => {
    equipment: Equipment | null;
    setEquipment: import('react').Dispatch<import('react').SetStateAction<Equipment | null>>;
    reloadEquipment: () => void;
};
