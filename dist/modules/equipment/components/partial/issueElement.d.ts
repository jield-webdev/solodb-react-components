import { Equipment, EquipmentModuleIssue, EquipmentModuleIssueAttachment } from '@jield/solodb-typescript-core';
export default function IssueElement({ issue, equipment, issueAttachments, reloadQueryFn, expanded, }: {
    issue: EquipmentModuleIssue;
    equipment: Equipment;
    issueAttachments: EquipmentModuleIssueAttachment[];
    reloadQueryFn: (key: string[]) => void;
    expanded?: boolean;
}): import("react/jsx-runtime").JSX.Element;
