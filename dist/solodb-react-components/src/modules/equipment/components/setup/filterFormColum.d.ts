import { FilterData, FilterFormData } from '../../../../../../solodb-typescript-core/src/index.ts';
export default function FilterFormColumn({ filterForm, filter, setFilterFn, }: {
    filterForm: FilterFormData;
    filter: FilterData | undefined;
    setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}): import("react/jsx-runtime").JSX.Element;
