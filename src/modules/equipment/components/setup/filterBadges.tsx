import React, { useEffect, useState } from "react";
import { FilterData, FilterFormData } from "@jield/solodb-typescript-core";

function cleanFilterData(data: FilterData): FilterData {
  let cleanedData = { ...data };
  cleanedData.facet = Object.fromEntries(Object.entries(data.facet).filter(([_, facet]) => facet.values.length > 0));

  if (data.filter.general.length <= 0) {
    cleanedData.filter.general = [];
  }

  return cleanedData;
}

function populateFilterData(filterFormData: FilterFormData): FilterData {
  let facet: { [fieldsetName: string]: { values: string[] } } = {};

  for (const fieldset of Object.entries(filterFormData.facet.fieldsets)) {
    facet[fieldset[0]] = { values: [] };
  }

  return {
    filter: { general: [] },
    facet: facet,
  };
}

export function FilterBadges({
  searchQuery,
  filter,
  filterForm,
  setFilterFn,
}: {
  searchQuery: string | undefined;
  filter: FilterData | null;
  filterForm: FilterFormData;
  setFilterFn: React.Dispatch<React.SetStateAction<FilterData | undefined>>;
}) {
  const [cleanedFilter, setCleanedFilter] = useState<FilterData | null>(null);

  useEffect(() => {
    if (filter === null) {
      setCleanedFilter(null);
      return;
    }

    setCleanedFilter(cleanFilterData(filter));
  }, [filter]);

  const handleClearFacet = (fieldsetName: string) => {
    const next: FilterData = filter
      ? { ...filter, filter: { ...filter.filter }, facet: { ...filter.facet } }
      : populateFilterData(filterForm);

    next.facet[fieldsetName] = { values: [] };
    setFilterFn(next);
  };

  const handleClearGeneralFilter = (value: string) => {
    const next: FilterData = filter
      ? { ...filter, filter: { ...filter.filter }, facet: { ...filter.facet } }
      : populateFilterData(filterForm);

    const idx = next.filter.general.indexOf(value);
    if (idx > -1) next.filter.general.splice(idx, 1);

    setFilterFn(next);
  };

  return (
    <div>
      {searchQuery && searchQuery !== "" && (
        <span className="m-1 badge bg-pill bg-info" style={{ cursor: "pointer" }}>
          Search: {searchQuery} <i className="fa fa-times"></i>
        </span>
      )}
      {cleanedFilter && filterForm && (
        <>
          {cleanedFilter.filter.general.map((entry) => (
            <span
              key={entry}
              className="m-1 badge bg-pill bg-info"
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleClearGeneralFilter(entry);
              }}
            >
              {entry} <i className="fa fa-times"></i>
            </span>
          ))}
          {Object.entries(cleanedFilter.facet).map(([name, facet]) => (
            <span
              key={name}
              className="m-1 badge bg-pill bg-info"
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleClearFacet(name);
              }}
            >
              {Object.values(filterForm.facet.fieldsets).find((fieldset) => fieldset.name == name)?.label ?? name}:{" "}
              {facet.values.join(" or ")} <i className="fa fa-times"></i>
            </span>
          ))}
        </>
      )}
    </div>
  );
}
