import { ServiceEventReport } from '../interfaces/service/event/serviceEventReport';
export default function getServiceEventReport({ id }: {
    id: number;
}): Promise<ServiceEventReport>;
