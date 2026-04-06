import { default as React } from 'react';
import { FilterData, FilterFormData } from '@jield/solodb-typescript-core';
export default function FilterFormBar({ filterForm, filter, setFilterFn, }: {
    filterForm: FilterFormData;
    filter: FilterData | undefined;
    setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}): import("react/jsx-runtime").JSX.Element;
