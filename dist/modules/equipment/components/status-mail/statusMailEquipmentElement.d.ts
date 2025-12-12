import { Equipment } from '../../interfaces/equipment';
import { EquipmentModuleIssue } from '../../interfaces/equipment/module/equipmentModuleIssue';
import { EquipmentModuleEcn } from '../../interfaces/equipment/module/equipmentModuleEcn';
import { EquipmentModule } from '../../interfaces/equipment/equipmentModule';
import { EquipmentModuleIssueAttachment } from '../../interfaces/equipment/module/issue/equipmentModuleIssueAttachment';
import { EquipmentModuleEcnAttachment } from '../../interfaces/equipment/module/ecn/equipmentModuleEcnAttachment';
import { EquipmentModuleReservation } from '../../interfaces/equipment/module/equipmentModuleReservation';
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
