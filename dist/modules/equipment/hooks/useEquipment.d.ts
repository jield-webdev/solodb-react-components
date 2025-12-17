import { Equipment } from 'solodb-typescript-core';
export declare const useEquipment: () => {
    equipment: Equipment | null;
    setEquipment: import('react').Dispatch<import('react').SetStateAction<Equipment | null>>;
    reloadEquipment: () => void;
};
