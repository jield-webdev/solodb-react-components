import { ApiFormattedResponse } from '../core/interfaces/response';
declare const PaginationLinks: ({ data, setPage, setPageSize, pageSize, isPlaceholderData, }: {
    data: ApiFormattedResponse<any> | undefined;
    setPage: (page: (old: number) => number) => void;
    setPageSize?: (pageSize: (old: number) => number) => void;
    pageSize?: number;
    isPlaceholderData: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export default PaginationLinks;
