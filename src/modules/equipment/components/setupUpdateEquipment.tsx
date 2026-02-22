import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";

export function populateFilterData(filterFormData: FilterFormData): FilterData {
  const facet = Object.fromEntries(Object.keys(filterFormData.facet.fieldsets).map((key) => [key, { values: [] }])) as {
    [fieldsetName: string]: { values: string[] };
  };

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

  const pageSize = 20;

  const queryClient = useQueryClient();

  const setupQuery = useQuery({
    queryKey: ["setup", id],
    queryFn: () => getSetup({ id: Number(id) }),
    enabled: Boolean(id),
  });

  const filterFormQuery = useQuery({
    queryKey: ["filter", environment, filter],
    queryFn: () => getFilter({ service: "equipment", formResult: filter, environment: environment }),
    enabled: Boolean(environment),
  });

  const isError = setupQuery.isError || filterFormQuery.isError;
  const setup = setupQuery.data;
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
  const [selectedSetupEquipmentIdMap, setSelectedSetupEquipmentIdMap] = useState<Map<number, number>>(
    new Map<number, number>()
  );
  const selectedEquipmentList = useMemo(() => Array.from(selectedEquipmentMap.values()), [selectedEquipmentMap]);

  // infinite query for equipments
  const {
    data: equipmentListData,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["equipment", environment, searchQuery, filter, equipmentSort],
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
    enabled: Boolean(environment),
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // manage the selected equipments
  useEffect(() => {
    if (setup !== undefined) {
      const equipmentMap = new Map<number, Equipment>();
      const setupEquipmentIdMap = new Map<number, number>();
      for (let i = 0; i < setup.setup_equipment.length; i++) {
        const setupEquipment = setup.setup_equipment[i];
        equipmentMap.set(setupEquipment.equipment.id, setupEquipment.equipment);
        setupEquipmentIdMap.set(setupEquipment.equipment.id, setupEquipment.id);
      }
      setSelectedEquipmentMap(equipmentMap);
      setSelectedSetupEquipmentIdMap(setupEquipmentIdMap);
    }
  }, [setup]);

  const addEquipmentMutation = useMutation({
    mutationFn: async (equipment: Equipment) => {
      if (!setup) return;
      await axios.post(`create/setup/equipment/${setup.id}`, {
        equipment_id: equipment.id,
      });
    },
    onMutate: (equipment) => {
      let previous: Map<number, Equipment> | undefined;
      setSelectedEquipmentMap((prev) => {
        previous = new Map(prev);
        const next = new Map(prev);
        next.set(equipment.id, equipment);
        return next;
      });
      return { previous: previous ?? new Map<number, Equipment>() };
    },
    onError: (error, _equipment, context) => {
      console.error("Failed to add equipment", error);
      if (context?.previous) {
        setSelectedEquipmentMap(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["setup"] });
    },
  });

  const removeEquipmentMutation = useMutation({
    mutationFn: async (equipment: Equipment) => {
      const setupEquipmentId = selectedSetupEquipmentIdMap.get(equipment.id);
      if (!setupEquipmentId) {
        throw new Error(`Missing setup equipment id for removal: ${equipment.id}`);
      }
      await axios.delete(`delete/setup/equipment/${setupEquipmentId}`);
    },
    onMutate: (equipment) => {
      let previous: Map<number, Equipment> | undefined;
      setSelectedEquipmentMap((prev) => {
        previous = new Map(prev);
        const next = new Map(prev);
        next.delete(equipment.id);
        return next;
      });
      return { previous: previous ?? new Map<number, Equipment>() };
    },
    onError: (error, _equipment, context) => {
      console.error("Failed to remove equipment", error);
      if (context?.previous) {
        setSelectedEquipmentMap(context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["setup"] });
    },
  });

  const addEquipment = (equipment: Equipment) => {
    if (!setup) return;
    addEquipmentMutation.mutate(equipment);
  };
  const removeEquipment = (equipment: Equipment) => {
    const setupEquipmentId = selectedSetupEquipmentIdMap.get(equipment.id);
    if (!setupEquipmentId) {
      console.error("Missing setup equipment id for removal", equipment.id);
      queryClient.invalidateQueries({ queryKey: ["setup"] });
      return;
    }
    removeEquipmentMutation.mutate(equipment);
  };

  if (isError) {
    return (
      <div className="alert alert-danger my-3" role="alert">
        Error loading:{" "}
        {[setupQuery, filterFormQuery]
          .filter((q) => q.isError)
          .map((q, idx) => {
            const message = q.error instanceof Error ? q.error.message : "Unknown error";
            return <span key={idx}>Query error {message}</span>;
          })}
      </div>
    );
  }

  if (setupQuery.isLoading) {
    return <LoadingComponent message={"Loading setup..."} />;
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
        <SelectedEquipmentTable equipmentList={selectedEquipmentList} removeEquipment={removeEquipment} />
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
                  page.items
                    ?.filter((equipment) => !equipment.is_in_fixed_setup)
                    .filter((e) => !selectedEquipmentMap.has(e.id))
                ) ?? []
              }
              currentFilter={filter}
              setEquipmentSort={setEquipmentSort}
              addEquipment={addEquipment}
              addDisabled={!setup?.id}
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
