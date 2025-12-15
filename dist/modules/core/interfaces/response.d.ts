export interface ApiFormattedResponse<T> {
    items: T[];
    amountOfPages: number;
    currentPage: number;
    totalItems: number;
    hasMore: boolean;
}
export interface ApiResponse<T> {
    _embedded: {
        items: T[];
    };
    page_count: number;
    total_items: number;
    page: number;
}
