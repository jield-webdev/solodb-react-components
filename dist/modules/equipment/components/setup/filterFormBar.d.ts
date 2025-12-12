import { FilterData, FilterFormData } from '../../../core/interfaces/filter';
import { default as React } from 'react';
export default function FilterFormBar({ filterForm, filter, setFilterFn, }: {
    filterForm: FilterFormData;
    filter: FilterData | undefined;
    setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}): import("react/jsx-runtime").JSX.Element;
