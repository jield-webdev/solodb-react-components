import { listRunParts, listRuns, type Run } from "@jield/solodb-typescript-core";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Nav } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Select, { type StylesConfig } from "react-select";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";
import { type ParentRunSelection } from "../../../hooks/useParentRunSelection";
import { groupPartsByLevel } from "./partGrouping";
import RunPartPicker from "./runPartPicker";
import SelectedRunList from "./selectedRunList";

type RunOption = { value: number; label: string; run: Run };

type ParentRunSelectProps = {
  selection: ParentRunSelection;
  /** When given, only runs available as parent for this run are offered. */
  run?: Run;
};

const selectPartGroups = (data: Awaited<ReturnType<typeof listRunParts>>) => groupPartsByLevel(data.items ?? []);

const toOption = (candidate: Run): RunOption => ({
  value: candidate.id,
  label: `${candidate.label} — ${candidate.name}`,
  run: candidate,
});

// customStyles is option-type agnostic, so narrowing it to RunOption is safe.
const runSelectStyles = customStyles as StylesConfig<RunOption, false>;

export default function ParentRunSelect({ selection, run }: ParentRunSelectProps) {
  const { environment } = useParams();
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [experimentalEdit, setExperimentalEdit] = useState(false);
  const [search, setSearch] = useState("");
  const { selectedRuns } = selection;

  const {
    data: runsData,
    isFetching: isRunsFetching,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: ["parentRuns", environment, run?.id, search],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      listRuns({
        environment,
        availableAsParentForRun: run,
        query: search || undefined,
        pageSize: 50,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.currentPage + 1 : undefined),
  });

  // One parts query per selected run, index-aligned with selectedRuns.
  const partQueries = useQueries({
    queries: selectedRuns.map((selectedRun) => ({
      queryKey: ["parentRunParts", selectedRun.id],
      queryFn: () => listRunParts({ run: selectedRun }),
      select: selectPartGroups,
    })),
  });

  const runOptions = useMemo(() => {
    const runs = new Map<number, Run>();
    for (const page of runsData?.pages ?? []) {
      for (const candidate of page.items ?? []) {
        runs.set(candidate.id, candidate);
      }
    }
    return Array.from(runs.values(), toOption);
  }, [runsData]);

  const visibleRunIndex =
    activeRunId === null
      ? 0
      : Math.max(
          0,
          selectedRuns.findIndex((selectedRun) => selectedRun.id === activeRunId)
        );
  const visibleRun = selectedRuns[visibleRunIndex] ?? null;
  const visiblePartsQuery = partQueries[visibleRunIndex];

  const selectRun = (selected: Run) => {
    selection.selectRun(selected);
    setActiveRunId(selected.id);
  };

  return (
    <div>
      <div className="mb-4">
        <h3>Select parent runs</h3>
        <Select<RunOption>
          isSearchable={true}
          isClearable={true}
          options={runOptions}
          inputValue={search}
          onInputChange={setSearch}
          placeholder={"— Select a run, or start typing"}
          captureMenuScroll={true}
          onMenuScrollToBottom={() => {
            if (hasNextPage && !isRunsFetching) {
              void fetchNextPage();
            }
          }}
          noOptionsMessage={() => (isError ? "Unable to load runs. Try searching again." : "No runs found")}
          filterOption={null}
          isLoading={isRunsFetching}
          value={null}
          styles={runSelectStyles}
          onChange={(option) => {
            if (option) {
              selectRun(option.run);
            }
          }}
        />
      </div>

      <SelectedRunList selectedRuns={selectedRuns} onDeselect={selection.deselectRun} />

      {selectedRuns.length > 0 && (
        <>
          <Nav
            variant="tabs"
            activeKey={visibleRun === null ? undefined : `run-${visibleRun.id}`}
            onSelect={(eventKey) => {
              if (eventKey?.startsWith("run-")) {
                setActiveRunId(Number(eventKey.replace("run-", "")));
              }
            }}
            className="mb-3"
          >
            {selectedRuns.map((selectedRun) => (
              <Nav.Item key={selectedRun.id}>
                <Nav.Link eventKey={`run-${selectedRun.id}`}>{selectedRun.label}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          <div className="ms-2 ps-2">
            {visibleRun && (
              <RunPartPicker
                key={visibleRun.id}
                run={visibleRun}
                selection={selection}
                partGroups={visiblePartsQuery?.data ?? []}
                isLoadingParts={visiblePartsQuery?.isFetching ?? false}
                experimentalEdit={experimentalEdit}
                onToggleExperimentalEdit={() => setExperimentalEdit((isEditing) => !isEditing)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
