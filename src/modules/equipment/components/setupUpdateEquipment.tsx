import { useInfiniteQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  Equipment,
  Facet,
  Filter,
  FilterData,
  FilterFormData,
  getFilter,
  getSetup,
  listEquipment,
} from "@jield/solodb-typescript-core";
import { useEffect, useMemo, useRef, useState } from "react";
import SelectedEquipmentTable from "./setup/selectedEquipmentTable";
import { useParams } from "react-router-dom";
import axios from "axios";
import SearchBox from "./setup/searchBox";
import FilterFormColumn from "./setup/filterFormColum";
import { useInView } from "react-intersection-observer";
import EquipmentTable from "./setup/equipmentTable";
import FilterFormBar from "./setup/filterFormBar";
import { FilterBadges } from "./setup/filterBadges";
import { Setup } from "@jield/solodb-typescript-core/dist/equipment/interfaces/setup";

export function populateFilterData(filterFormData: FilterFormData): FilterData {
  let facet: { [fieldsetName: string]: { values: string[] } } = {};

  for (const fieldset of Object.entries(filterFormData.facet.fieldsets)) {
    facet[fieldset[0]] = { values: [] };
  }

  return {
    filter: { general: [] },
    facet: facet,
  };
}

export default function SetupUpdateEquipment() {
  const { id, environment } = useParams();
  const { ref, inView } = useInView();

  const [equipmentSort, setEquipmentSort] = useState<{ order: string; direction?: "asc" | "desc" }>({
    order: "default",
  });
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<FilterData | undefined>(undefined);

  const [pageSize] = useState<number>(20);

  const queryClient = useQueryClient();

  const queries = useQueries({
    queries: [
      {
        queryKey: ["setup"],
        queryFn: () => getSetup({ id: Number(id) }),
      },
      {
        queryKey: ["filter", JSON.stringify(filter)],
        queryFn: () => getFilter({ service: "equipment", formResult: filter, environment: environment }),
      },
    ],
  });

  const reloadQueriesByKey = (key: any[]) => {
    queryClient.refetchQueries({ queryKey: key });
  };

  const [setupQuery, filterFormQuery] = queries;

  const isError = queries.some((query) => query.isError);

  const setup = useMemo(() => setupQuery.data as unknown as Setup, [setupQuery.data]);
  const previousFilterFormData = useRef<FilterFormData | undefined>(undefined);
  const filterFormData = useMemo<FilterFormData>(() => {
    if (filterFormQuery.data === undefined) {
      if (previousFilterFormData.current !== undefined) {
        return previousFilterFormData.current;
      }

      // When memo is empty, return an instantiated (but empty) FilterFormData object
      // that satisfies the required structure of Filter and Facet
      return {
        filter: {
          name: "",
          label: null,
          elements: [],
          fieldsets: {},
        } as Filter,
        facet: {
          name: "",
          label: null,
          visibility: "",
          elements: [],
          fieldsets: {},
        } as Facet,
      } as FilterFormData;
    }

    previousFilterFormData.current = filterFormQuery.data;
    return filterFormQuery.data as FilterFormData;
  }, [filterFormQuery.data]);

  useEffect(() => {
    if (filterFormData === undefined || filter !== undefined) {
      return;
    }

    setFilter(populateFilterData(filterFormData));
  }, [filterFormData, filter]);

  const [selectedEquipmentMap, setSelectedEquipmentMap] = useState<Map<number, Equipment>>(
    new Map<number, Equipment>()
  );

  // infinite query for equipments
  const {
    data: equipmentListData,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["equipment", searchQuery, JSON.stringify(filter), JSON.stringify(equipmentSort)],
    queryFn: async ({ pageParam }) => {
      const res = await listEquipment({
        environment: environment,
        page: pageParam,
        pageSize,
        query: searchQuery,
        filter,
        order: equipmentSort.order,
        direction: equipmentSort.direction,
      });
      return {
        items: res.items,
        hasMore: res.hasMore,
        nextPage: pageParam + 1,
        prevPage: pageParam > 1 ? pageParam - 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    getPreviousPageParam: (firstPage) => firstPage.prevPage ?? undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // manage the selected equipments
  useEffect(() => {
    if (setup !== undefined) {
      const equipmentMap = new Map<number, Equipment>();
      for (let i = 0; i < setup.setup_equipment.length; i++) {
        const setupEquipment = setup.setup_equipment[i];
        equipmentMap.set(setupEquipment.equipment.id, setupEquipment.equipment);
      }
      setSelectedEquipmentMap(equipmentMap);
    }
  }, [setup]);

  const addEquipment = (equipment: Equipment) => {
    setSelectedEquipmentMap((prev) => new Map(prev.set(equipment.id, equipment)));
  };

  const removeEquipment = (equipment: Equipment) => {
    setSelectedEquipmentMap((prev) => {
      const map = new Map(prev);
      map.delete(equipment.id);
      return map;
    });
  };

  // Update selected equipments in backend
  useEffect(() => {
    if (!setup) return;

    const originalIds = setup.setup_equipment.map((e: { id: number }) => e.id).sort((a: number, b: number) => a - b);
    const currentIds = Array.from(selectedEquipmentMap.keys()).sort((a, b) => a - b);

    const isEqual =
      originalIds.length === currentIds.length &&
      originalIds.every((id: number, index: number) => id === currentIds[index]);

    if (isEqual) {
      return;
    }

    const submit = async () => {
      try {
        const data = {
          equipment_list: currentIds,
        };

        await axios.patch(`update/setup/${setup.id}/equipment`, data);
      } catch (error) {
        console.error("Failed to update equipment", error);
      }
    };

    submit();
  }, [selectedEquipmentMap]);

  if (isError) {
    return (
      <div className="alert alert-danger my-3" role="alert">
        Error loading:{" "}
        {queries
          .filter((q) => q.isError)
          .map((q, idx) => {
            return <span key={idx}>Query error {q.error.message}</span>;
          })}
      </div>
    );
  }

  return (
    <>
      {/* Headers */}
      <div>
        <h1>Change equipment in setup</h1>
        <p>Given here an overview of all equipment</p>
      </div>
      {/* Selected equipment */}
      <div>
        <div className={"d-flex align-items-center gap-2"}>
          <h2>Selected equipment</h2>
          <a
            href={`/${environment}/equipment/setup/details/${setup?.id ?? 0}/general.html`}
            className="btn btn-sm btn-outline-primary"
          >
            Return to setup
          </a>
        </div>
        <SelectedEquipmentTable
          setup={setup}
          equipmentList={Array.from(selectedEquipmentMap).map(([_, value]) => value)}
          removeEquipment={removeEquipment}
          refetchQueries={reloadQueriesByKey}
        />
      </div>
      {/* Equipment table */}
      <div className="row">
        <div className="col-md-10">
          <h2>Available equipment</h2>

          <nav className="navbar bg-body-tertiary my-3 d-flex">
            <FilterFormBar filterForm={filterFormData} filter={filter} setFilterFn={setFilter} />
            <SearchBox
              setSearchQuery={setSearchQuery}
              resetFilter={() => {
                setFilter(populateFilterData(filterFormData));
              }}
            />
          </nav>
          <div>
            <FilterBadges
              searchQuery={searchQuery}
              filter={filter ?? null}
              filterForm={filterFormData}
              setFilterFn={setFilter}
            />
            <EquipmentTable
              equipmentList={
                equipmentListData?.pages.flatMap((page) =>
                  page.items?.filter((e) => !selectedEquipmentMap.has(e.id))
                ) ?? []
              }
              currentFilter={filter}
              setEquipmentSort={setEquipmentSort}
              addEquipment={addEquipment}
            />
          </div>
          <div ref={ref}>{isFetching ? "Fetching new equipment..." : null}</div>
          <a
            href={`/${environment}/equipment/setup/details/${setup?.id ?? 0}/general.html`}
            className="btn btn-sm btn-outline-primary"
          >
            Return to setup
          </a>
        </div>
        {/* Right column */}
        <div className="col-md-2">
          <h3>Filter</h3>
          <FilterFormColumn filterForm={filterFormData} filter={filter} setFilterFn={setFilter} />
        </div>
      </div>
    </>
  );
}
