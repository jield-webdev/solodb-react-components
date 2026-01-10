import { Equipment, EquipmentModule, EquipmentModuleEcn, EquipmentModuleEcnAttachment, EquipmentModuleIssue, EquipmentModuleIssueAttachment, EquipmentModuleReservation } from '../../../../../../solodb-typescript-core/src/index.ts';
export default function StatusMailEquipmentElement({ equipment, modules, issues, issueAttachments, ecnNotes, ecnAttachments, reloadQueryFn, showIssues, reservations, }: {
    equipment: Equipment;
    modules: EquipmentModule[];
    issues: EquipmentModuleIssue[];
    issueAttachments: EquipmentModuleIssueAttachment[];
    ecnNotes: EquipmentModuleEcn[];
    ecnAttachments: EquipmentModuleEcnAttachment[];
    reloadQueryFn: (key: string[]) => void;
    showIssues: 1 | 2 | 3;
    reservations: EquipmentModuleReservation[];
}): import("react/jsx-runtime").JSX.Element;
