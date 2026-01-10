import { default as React } from 'react';
import { FilterData, FilterFormData } from '@jield/solodb-typescript-core';
export declare function FilterBadges({ searchQuery, filter, filterForm, setFilterFn, }: {
    searchQuery: string | undefined;
    filter: FilterData | null;
    filterForm: FilterFormData;
    setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}): import("react/jsx-runtime").JSX.Element;
