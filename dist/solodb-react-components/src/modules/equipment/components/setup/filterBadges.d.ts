import { default as React } from 'react';
import { FilterData, FilterFormData } from '../../../../../../solodb-typescript-core/src/index.ts';
export declare function FilterBadges({ searchQuery, filter, filterForm, setFilterFn, }: {
    searchQuery: string | undefined;
    filter: FilterData | null;
    filterForm: FilterFormData;
    setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}): import("react/jsx-runtime").JSX.Element;
