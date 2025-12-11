import { ServiceEventPlace } from "@/modules/service/interfaces/service/event/serviceEventPlace";
import { Service } from "@/modules/service/interfaces/service";

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
