import { default as React } from 'react';
import { Equipment } from '../../interfaces/equipment';
import { EquipmentModuleIssue } from '../../interfaces/equipment/module/equipmentModuleIssue';
import { EquipmentModuleIssueAttachment } from '../../interfaces/equipment/module/issue/equipmentModuleIssueAttachment';
interface IssueModalFormProps {
    equipment: Equipment;
    showModal: boolean;
    onClose: (equipmentModuleIssue?: EquipmentModuleIssue) => void;
    issue?: EquipmentModuleIssue;
    attachments?: EquipmentModuleIssueAttachment[];
}
declare const IssueModalForm: React.FC<IssueModalFormProps>;
export default IssueModalForm;
