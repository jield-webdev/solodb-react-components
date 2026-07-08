import { default as React } from 'react';
import { Equipment, EquipmentModuleIssue, EquipmentModuleIssueAttachment } from '@jield/solodb-typescript-core';
export default function IssueElement({ issue, equipment, issueAttachments, reloadQueryFn, expanded, }: {
    issue: EquipmentModuleIssue;
    equipment: Equipment;
    issueAttachments: EquipmentModuleIssueAttachment[];
    reloadQueryFn: (key: string[]) => void;
    expanded?: boolean;
}): React.JSX.Element;
