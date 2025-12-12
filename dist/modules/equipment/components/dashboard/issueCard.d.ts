import { Equipment } from '../../interfaces/equipment';
import { EquipmentModuleIssue } from '../../interfaces/equipment/module/equipmentModuleIssue';
import { EquipmentModuleIssueAttachment } from '../../interfaces/equipment/module/issue/equipmentModuleIssueAttachment';
export default function IssueCard({ issue, equipment, issueAttachments, reloadQueryFn, }: {
    issue: EquipmentModuleIssue;
    equipment: Equipment;
    issueAttachments: EquipmentModuleIssueAttachment[];
    reloadQueryFn: (key: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
