import { FilterData, FilterFormData } from '../interfaces/filter';
export default function GetFilter({ service, environment, formResult, }: {
    service: string;
    environment?: string;
    formResult?: FilterData;
}): Promise<FilterFormData>;
