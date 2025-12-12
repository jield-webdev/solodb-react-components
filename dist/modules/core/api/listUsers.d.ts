import { User } from '../interfaces/user';
import { ApiFormattedResponse } from '../interfaces/response';
declare const _default: ({ query, selection, }: {
    query?: string;
    selection?: number;
}) => Promise<ApiFormattedResponse<User>>;
export default _default;
