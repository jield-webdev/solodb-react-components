import { Fieldset, FieldsetElement, FilterData, FilterFormData } from "@jield/solodb-typescript-core";
import { populateFilterData } from "../setupUpdateEquipment";

function getValueOptions(element: FieldsetElement): Record<string, string> | undefined {
  return element.value_options ?? element.options?.value_options;
}

function safeId(...parts: Array<string | undefined | null>): string {
  return parts
    .filter(Boolean)
    .join("-")
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_\-:]/g, "");
}

function FilterElement({
  filterElement,
  parent,
  filter,
  toggleFilterFn,
}: {
  filterElement: FieldsetElement;
  parent: string;
  filter: FilterData | undefined;
  toggleFilterFn: (value: string) => void;
}) {
  const valueOptions = getValueOptions(filterElement);
  if (!valueOptions) return null;

  return (
    <div className="mb-3">
      <strong>{filterElement.label ?? filterElement.name}</strong>
      {Object.entries(valueOptions).map(([value, label]) => {
        const id = safeId(parent, filterElement.name, value);
        const checked = !!filter?.filter?.general.includes(value);
        return (
          <div key={id} className="form-check">
            <input
              type="checkbox"
              id={id}
              name={`filter[${parent}][]`}
              onChange={() => {
                toggleFilterFn(value);
              }}
              className="form-check-input"
              checked={checked}
            />
            <label htmlFor={id} className="form-check-label" dangerouslySetInnerHTML={{ __html: label }} />
          </div>
        );
      })}
    </div>
  );
}

function FilterFieldset({
  fieldset,
  filter,
  toggleFacetFn,
}: {
  fieldset: Fieldset;
  filter: FilterData | undefined;
  toggleFacetFn: (fieldsetName: string, value: string) => void;
}) {
  return (
    <div className="simple-load-more load-more">
      <strong>{fieldset.label ?? fieldset.name} </strong>

      {fieldset.elements.map((element) => {
        const valueOptions = getValueOptions(element);
        if (!valueOptions) return null;

        return Object.entries(valueOptions).map(([value, label]) => {
          const id = safeId(fieldset.name, element.name, value);
          const checked = !!filter?.facet?.[fieldset.name]?.values.includes(value);
          return (
            <div key={id} className="form-check form-check-search">
              <input
                type="checkbox"
                id={id}
                name={`facet[${fieldset.name}][${element.name}][]`}
                className="form-check-input"
                onChange={() => {
                  toggleFacetFn(fieldset.name, value);
                }}
                checked={checked}
              />
              <label htmlFor={id} className="form-check-label" dangerouslySetInnerHTML={{ __html: label }} />
            </div>
          );
        });
      })}

      {Object.values(fieldset.fieldsets).map((fieldset) => (
        <div key={`${fieldset.name}`} className="ms-3">
          <FilterFieldset fieldset={fieldset} filter={filter} toggleFacetFn={toggleFacetFn} />
        </div>
      ))}
    </div>
  );
}

export default function FilterFormColumn({
  filterForm,
  filter,
  setFilterFn,
}: {
  filterForm: FilterFormData;
  filter: FilterData | undefined;
  setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}) {
  const handleToggleFacet = (fieldsetName: string, value: string) => {
    const next: FilterData = filter
      ? { ...filter, filter: { ...filter.filter }, facet: { ...filter.facet } }
      : populateFilterData(filterForm);

    if (!next.facet[fieldsetName]) {
      next.facet[fieldsetName] = { values: [] };
    } else {
      next.facet[fieldsetName].values = [...next.facet[fieldsetName].values];
    }

    const wasChecked = filter?.facet?.[fieldsetName]?.values.includes(value);

    if (wasChecked) {
      const idx = next.facet[fieldsetName].values.indexOf(value);
      if (idx > -1) next.facet[fieldsetName].values.splice(idx, 1);
    } else {
      next.facet[fieldsetName].values.push(value);
    }

    setFilterFn(next);
  };

  const handleToggleGeneralFilter = (value: string) => {
    const next: FilterData = filter
      ? { ...filter, filter: { ...filter.filter }, facet: { ...filter.facet } }
      : populateFilterData(filterForm);

    const wasChecked = filter?.filter.general.includes(value);

    if (wasChecked) {
      const idx = next.filter.general.indexOf(value);
      if (idx > -1) next.filter.general.splice(idx, 1);
    } else {
      next.filter.general.push(value);
    }

    setFilterFn(next);
  };

  return (
    <div key={filterForm.filter.name}>
      {filterForm.filter.elements.map((element) => (
        <FilterElement
          key={`${filterForm.filter.name}-${element.name}`}
          filterElement={element}
          filter={filter}
          parent={filterForm.filter.name}
          toggleFilterFn={handleToggleGeneralFilter}
        />
      ))}

      {Object.values(filterForm.facet.fieldsets).map((fieldset) => {
        if (fieldset.visibility == "filter_bar") {
          return null;
        }
        return (
          <FilterFieldset
            key={`${filterForm.filter.name}-${fieldset.name}`}
            fieldset={fieldset}
            filter={filter}
            toggleFacetFn={handleToggleFacet}
          />
        );
      })}
    </div>
  );
}
