import { Equipment, EquipmentModuleEcn, EquipmentModuleEcnAttachment } from 'solodb-typescript-core';
export default function EcnElement({ ecn, equipment, ecnAttachments, reloadQueryFn, expanded, }: {
    ecn: EquipmentModuleEcn;
    equipment: Equipment;
    ecnAttachments: EquipmentModuleEcnAttachment[];
    reloadQueryFn: (key: string[]) => void;
    expanded?: boolean;
}): import("react/jsx-runtime").JSX.Element;
