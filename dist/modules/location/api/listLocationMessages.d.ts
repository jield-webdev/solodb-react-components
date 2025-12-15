import { ApiFormattedResponse } from '../../core/interfaces/response';
import { StatusMail } from '../../equipment/interfaces/statusMail';
import { LocationMessage } from '../interfaces/locationMessage';
export default function ListLocationMessages({ statusMail, }: {
    statusMail?: StatusMail;
}): Promise<ApiFormattedResponse<LocationMessage>>;
