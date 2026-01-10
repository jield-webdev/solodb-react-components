import { Equipment, EquipmentModuleEcn, EquipmentModuleEcnAttachment } from '../../../../../../solodb-typescript-core/src/index.ts';
export default function EcnCard({ ecn, equipment, ecnAttachments, reloadQueryFn, }: {
    ecn: EquipmentModuleEcn;
    equipment: Equipment;
    ecnAttachments: EquipmentModuleEcnAttachment[];
    reloadQueryFn: (key: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
