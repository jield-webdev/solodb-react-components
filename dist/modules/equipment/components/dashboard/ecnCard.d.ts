import { JSX } from 'react';
import { Equipment, EquipmentModuleEcn, EquipmentModuleEcnAttachment } from '@jield/solodb-typescript-core';
export default function EcnCard({ ecn, equipment, ecnAttachments, reloadQueryFn, }: {
    ecn: EquipmentModuleEcn;
    equipment: Equipment;
    ecnAttachments: EquipmentModuleEcnAttachment[];
    reloadQueryFn: (key: string[]) => void;
}): JSX.Element;
