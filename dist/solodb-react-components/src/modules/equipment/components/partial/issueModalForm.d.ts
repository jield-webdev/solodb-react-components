import { default as React } from 'react';
import { Equipment, EquipmentModuleIssue, EquipmentModuleIssueAttachment } from '../../../../../../solodb-typescript-core/src/index.ts';
interface IssueModalFormProps {
    equipment: Equipment;
    showModal: boolean;
    onClose: (equipmentModuleIssue?: EquipmentModuleIssue) => void;
    issue?: EquipmentModuleIssue;
    attachments?: EquipmentModuleIssueAttachment[];
}
declare const IssueModalForm: React.FC<IssueModalFormProps>;
export default IssueModalForm;
