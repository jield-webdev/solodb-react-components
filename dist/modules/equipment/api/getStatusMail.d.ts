import { StatusMail } from '../interfaces/statusMail';
export default function GetStatusMail({ id }: {
    id: number;
}): Promise<StatusMail>;
