import { EquipmentModuleIssue } from '../../interfaces/equipment/module/equipmentModuleIssue';
import { EquipmentModule } from '../../interfaces/equipment/equipmentModule';
import { EquipmentModuleIssueAttachment } from '../../interfaces/equipment/module/issue/equipmentModuleIssueAttachment';
interface IssueTableProps {
    issues: EquipmentModuleIssue[];
    modules: EquipmentModule[];
    issueAttachments: EquipmentModuleIssueAttachment[];
    reloadQueryFn: (key: string[]) => void;
}
export default function IssueTable({ issues, modules, issueAttachments, reloadQueryFn }: IssueTableProps): import("react/jsx-runtime").JSX.Element;
export {};
