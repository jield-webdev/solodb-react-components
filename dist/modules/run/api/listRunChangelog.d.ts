import { Run } from '../interfaces/run';
import { Changelog } from '../interfaces/run/changelog';
import { ApiFormattedResponse } from '../../core/interfaces/response';
export default function ListRunChangelog({ run, page, }: {
    run: Run;
    page: number;
}): Promise<ApiFormattedResponse<Changelog>>;
