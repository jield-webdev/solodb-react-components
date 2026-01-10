import { populateFilterData } from "../setupUpdateEquipment";
import { NavDropdown } from "react-bootstrap";
import React from "react";
import { Fieldset, FieldsetElement, FilterData, FilterFormData } from "@jield/solodb-typescript-core";

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
    <NavDropdown title={fieldset.label ?? fieldset.name} id="category" menuVariant="dark" className="me-3">
      {fieldset.elements.map((element) => {
        const valueOptions = getValueOptions(element);
        if (!valueOptions) return null;

        return Object.entries(valueOptions).map(([value, label]) => {
          const id = safeId(fieldset.name, element.name, value);
          const checked = !!filter?.facet?.[fieldset.name]?.values.includes(value);
          return (
            <NavDropdown.Item
              key={id}
              eventKey="1"
              onClick={() => {
                toggleFacetFn(fieldset.name, value);
              }}
            >
              <i className={`fa ${checked ? "fa-check-square-o" : "fa-square-o"}`} />{" "}
              <label htmlFor={id} className="form-check-label" dangerouslySetInnerHTML={{ __html: label }} />
            </NavDropdown.Item>
          );
        });
      })}
    </NavDropdown>
  );
}

export default function FilterFormBar({
  filterForm,
  filter,
  setFilterFn,
}: {
  filterForm: FilterFormData;
  filter: FilterData | undefined;
  setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}) {
  if (!filterForm) {
    return <></>;
  }

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

  return (
    <div className="d-flex flex-row" key={filterForm.filter.name}>
      {Object.values(filterForm.facet.fieldsets).map((fieldset) => {
        if (fieldset.visibility == "filter_column") {
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
