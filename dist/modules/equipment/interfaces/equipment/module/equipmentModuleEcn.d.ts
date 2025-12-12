import { User } from '../../../../core/interfaces/user';
export interface EquipmentModuleEcn {
    id: number;
    module_id: number;
    ecn: string;
    description: string;
    date_created: string;
    owner: User;
    date_closed: string;
    last_update: string;
    updated_by?: User;
    attachments: number;
}
