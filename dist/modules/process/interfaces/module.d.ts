import { Process } from './process';
import { EquipmentModule } from '../../equipment/interfaces/equipment/equipmentModule';
export interface ProcessModule {
    id: number;
    process: Process;
    module: EquipmentModule;
    in_use: boolean;
    is_assembly_process: boolean;
    has_local_parameters: boolean;
}
