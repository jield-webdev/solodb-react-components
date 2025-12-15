import { default as React } from 'react';
import { Equipment } from '../../interfaces/equipment';
import { EquipmentModuleEcn } from '../../interfaces/equipment/module/equipmentModuleEcn';
import { EquipmentModuleEcnAttachment } from '../../interfaces/equipment/module/ecn/equipmentModuleEcnAttachment';
interface EcnModalFormProps {
    equipment: Equipment;
    showModal: boolean;
    onClose: (equipmentModuleEcn?: EquipmentModuleEcn) => void;
    ecn?: EquipmentModuleEcn;
    attachments?: EquipmentModuleEcnAttachment[];
}
declare const EcnModalForm: React.FC<EcnModalFormProps>;
export default EcnModalForm;
