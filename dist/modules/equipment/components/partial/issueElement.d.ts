import { EquipmentModuleIssue } from '../../interfaces/equipment/module/equipmentModuleIssue';
import { EquipmentModuleIssueAttachment } from '../../interfaces/equipment/module/issue/equipmentModuleIssueAttachment';
import { Equipment } from '../../interfaces/equipment';
export default function IssueElement({ issue, equipment, issueAttachments, reloadQueryFn, expanded, }: {
    issue: EquipmentModuleIssue;
    equipment: Equipment;
    issueAttachments: EquipmentModuleIssueAttachment[];
    reloadQueryFn: (key: string[]) => void;
    expanded?: boolean;
}): import("react/jsx-runtime").JSX.Element;
