import { Equipment } from '../../../../../solodb-typescript-core/src/index.ts';
export declare const useEquipment: () => {
    equipment: Equipment | null;
    setEquipment: import('react').Dispatch<import('react').SetStateAction<Equipment | null>>;
    reloadEquipment: () => void;
};
