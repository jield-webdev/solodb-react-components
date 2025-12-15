import { Equipment } from '../../interfaces/equipment';
import { EquipmentModuleEcnAttachment } from '../../interfaces/equipment/module/ecn/equipmentModuleEcnAttachment';
import { EquipmentModuleEcn } from '../../interfaces/equipment/module/equipmentModuleEcn';
export default function EcnCard({ ecn, equipment, ecnAttachments, reloadQueryFn, }: {
    ecn: EquipmentModuleEcn;
    equipment: Equipment;
    ecnAttachments: EquipmentModuleEcnAttachment[];
    reloadQueryFn: (key: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
