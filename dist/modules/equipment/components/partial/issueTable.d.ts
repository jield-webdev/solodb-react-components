import { EquipmentModule, EquipmentModuleIssue, EquipmentModuleIssueAttachment } from '@jield/solodb-typescript-core';
interface IssueTableProps {
    issues: EquipmentModuleIssue[];
    modules: EquipmentModule[];
    issueAttachments: EquipmentModuleIssueAttachment[];
    reloadQueryFn: (key: string[]) => void;
}
export default function IssueTable({ issues, modules, issueAttachments, reloadQueryFn }: IssueTableProps): import("react/jsx-runtime").JSX.Element;
export {};
