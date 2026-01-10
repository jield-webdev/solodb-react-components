import { Equipment, EquipmentModuleIssue, EquipmentModuleIssueAttachment } from '@jield/solodb-typescript-core';
export default function IssueCard({ issue, equipment, issueAttachments, reloadQueryFn, }: {
    issue: EquipmentModuleIssue;
    equipment: Equipment;
    issueAttachments: EquipmentModuleIssueAttachment[];
    reloadQueryFn: (key: string[]) => void;
}): import("react/jsx-runtime").JSX.Element;
