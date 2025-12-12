import { Equipment } from '../../equipment/interfaces/equipment';
import { ServiceType } from './serviceType';
import { Department } from '../../organisation/interfaces/department';
import { ServiceEventPlace } from './service/event/serviceEventPlace';
import { ServiceTeam } from './serviceTeam';
export interface Service {
    id: number;
    name: string;
    description: string;
    minutes_needed_for_service: number;
    service_valid_months: number;
    date_created: string;
    last_update: string;
    type: ServiceType;
    place: ServiceEventPlace;
    team: ServiceTeam;
    department: Department;
    equipment: Equipment;
    latest_event_id: number;
    latest_event_report_id: number;
}
