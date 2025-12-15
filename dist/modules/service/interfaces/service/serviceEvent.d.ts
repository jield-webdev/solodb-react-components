import { ServiceEventPlace } from './event/serviceEventPlace';
import { Service } from '.';
export interface ServiceEvent {
    id: number;
    guid: string;
    date_created: string;
    last_update: string;
    date_planned: string;
    date_executed: string;
    service: Service;
    place?: ServiceEventPlace;
}
