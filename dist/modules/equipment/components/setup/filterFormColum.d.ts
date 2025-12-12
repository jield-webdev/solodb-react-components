import { FilterData, FilterFormData } from '../../../core/interfaces/filter';
export default function FilterFormColumn({ filterForm, filter, setFilterFn, }: {
    filterForm: FilterFormData;
    filter: FilterData | undefined;
    setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}): import("react/jsx-runtime").JSX.Element;
