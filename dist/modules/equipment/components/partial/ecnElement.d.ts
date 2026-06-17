import { JSX } from 'react';
import { Equipment, EquipmentModuleEcn, EquipmentModuleEcnAttachment } from '@jield/solodb-typescript-core';
export default function EcnElement({ ecn, equipment, ecnAttachments, reloadQueryFn, expanded, }: {
    ecn: EquipmentModuleEcn;
    equipment: Equipment;
    ecnAttachments: EquipmentModuleEcnAttachment[];
    reloadQueryFn: (key: string[]) => void;
    expanded?: boolean;
}): JSX.Element;
