import { EquipmentModuleEcn } from '../../interfaces/equipment/module/equipmentModuleEcn';
import { Equipment } from '../../interfaces/equipment';
import { EquipmentModuleEcnAttachment } from '../../interfaces/equipment/module/ecn/equipmentModuleEcnAttachment';
export default function EcnElement({ ecn, equipment, ecnAttachments, reloadQueryFn, expanded, }: {
    ecn: EquipmentModuleEcn;
    equipment: Equipment;
    ecnAttachments: EquipmentModuleEcnAttachment[];
    reloadQueryFn: (key: string[]) => void;
    expanded?: boolean;
}): import("react/jsx-runtime").JSX.Element;
