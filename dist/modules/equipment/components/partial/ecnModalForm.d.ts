import { default as React } from 'react';
import { Equipment, EquipmentModuleEcn, EquipmentModuleEcnAttachment } from 'solodb-typescript-core';
interface EcnModalFormProps {
    equipment: Equipment;
    showModal: boolean;
    onClose: (equipmentModuleEcn?: EquipmentModuleEcn) => void;
    ecn?: EquipmentModuleEcn;
    attachments?: EquipmentModuleEcnAttachment[];
}
declare const EcnModalForm: React.FC<EcnModalFormProps>;
export default EcnModalForm;
