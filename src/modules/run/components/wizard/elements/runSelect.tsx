import { listRunParts, listRuns, type Run, type RunPart } from "@jield/solodb-typescript-core";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Badge, Button, Form, Nav, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";

type RunOption = { value: number; label: string; run: Run };

type PartLevelGroup = { level: number; parts: RunPart[] };

type RunSelectProps = {
  selectedRuns: Run[];
  setSelectedRuns: (selectedRuns: Run[]) => void;
  selectedPartIdsByRunId: Record<number, number[]>;
  setSelectedPartIdsByRunId: (selectedPartIdsByRunId: Record<number, number[]>) => void;
  descriptionsByRunId: Record<number, string>;
  setDescriptionsByRunId: (descriptionsByRunId: Record<number, string>) => void;
};

// Parts are ordered the same way the run part list orders them: by root first,
// then by their position (`left`) so siblings stay together within a level.
const sortParts = (a: RunPart, b: RunPart): number => {
  if (a.root_id && b.root_id && a.root_id !== b.root_id) {
    return a.root_id - b.root_id;
  }
  return a.left - b.left;
};

const groupPartsByLevel = (parts: RunPart[]): PartLevelGroup[] => {
  const byLevel = new Map<number, RunPart[]>();

  for (const part of parts) {
    const list = byLevel.get(part.part_level) ?? [];
    list.push(part);
    byLevel.set(part.part_level, list);
  }

  return Array.from(byLevel.entries())
    .toSorted(([levelA], [levelB]) => levelA - levelB)
    .map(([level, levelParts]) => ({ level, parts: levelParts.toSorted(sortParts) }));
};

const isRunOption = (option: unknown): option is RunOption => {
  return (
    typeof option === "object" &&
    option !== null &&
    "value" in option &&
    typeof (option as { value?: unknown }).value === "number" &&
    "run" in option &&
    typeof (option as { run?: unknown }).run === "object" &&
    (option as { run?: unknown }).run !== null
  );
};

export default function RunSelect({
  selectedRuns,
  setSelectedRuns,
  selectedPartIdsByRunId,
  setSelectedPartIdsByRunId,
  descriptionsByRunId,
  setDescriptionsByRunId,
}: RunSelectProps) {
  const { environment } = useParams();
  const [activeRunId, setActiveRunId] = useState<number | null>(null);

  const { data: runsData, isFetching: isRunsFetching } = useQuery({
    queryKey: [environment],
    queryFn: () => listRuns({ environment: environment }),
  });

  const partQueries = useQueries({
    queries: selectedRuns.map((run) => ({
      queryKey: [run.id],
      queryFn: () => listRunParts({ run }),
    })),
  });

  const runs: Run[] = useMemo(() => runsData?.items ?? [], [runsData?.items]);
  const selectedRunIds = useMemo(() => new Set(selectedRuns.map((run) => run.id)), [selectedRuns]);
  const visibleRunId =
    activeRunId !== null && selectedRunIds.has(activeRunId) ? activeRunId : (selectedRuns[0]?.id ?? null);

  const getPartQuery = (runId: number) => partQueries[selectedRuns.findIndex((run) => run.id === runId)];

  const getPartGroups = (runId: number): PartLevelGroup[] => {
    const parts = getPartQuery(runId)?.data?.items ?? [];
    return groupPartsByLevel(parts);
  };

  // listRuns has no server-side query param, so filter the already-loaded runs client-side.
  const loadOptions = (inputValue: string, callback: (options: RunOption[]) => void) => {
    const query = inputValue.toLowerCase();
    const options: RunOption[] = [];

    for (const run of runs) {
      if (!query || run.label.toLowerCase().includes(query) || run.name.toLowerCase().includes(query)) {
        options.push({ value: run.id, label: `${run.label} — ${run.name}`, run });
      }
    }

    callback(options);
  };

  const setRunPartIds = (runId: number, partIds: number[]) => {
    const next = { ...selectedPartIdsByRunId };
    if (partIds.length > 0) {
      next[runId] = partIds;
    } else {
      delete next[runId];
    }
    setSelectedPartIdsByRunId(next);
  };

  const setRunDescription = (runId: number, description: string) => {
    const next = { ...descriptionsByRunId };
    if (description) {
      next[runId] = description;
    } else {
      delete next[runId];
    }
    setDescriptionsByRunId(next);
  };

  const selectRun = (run: Run) => {
    if (selectedRunIds.has(run.id)) {
      setActiveRunId(run.id);
      return;
    }

    setSelectedRuns([...selectedRuns, run]);
    setActiveRunId(run.id);
  };

  const deselectRun = (runId: number) => {
    const nextSelectedRuns = selectedRuns.filter((run) => run.id !== runId);
    setSelectedRuns(nextSelectedRuns);
    setRunPartIds(runId, []);
    setRunDescription(runId, "");

    if (activeRunId === runId) {
      setActiveRunId(nextSelectedRuns[0]?.id ?? null);
    }
  };

  const getSelectedPartIds = (runId: number): number[] => selectedPartIdsByRunId[runId] ?? [];

  const isPartSelected = (runId: number, id: number): boolean => getSelectedPartIds(runId).includes(id);

  const togglePart = (runId: number, id: number) => {
    const selectedPartIds = getSelectedPartIds(runId);
    setRunPartIds(
      runId,
      selectedPartIds.includes(id) ? selectedPartIds.filter((partId) => partId !== id) : [...selectedPartIds, id]
    );
  };

  const allLevelSelected = (runId: number, group: PartLevelGroup): boolean => {
    const selectedPartIds = getSelectedPartIds(runId);
    return group.parts.length > 0 && group.parts.every((part) => selectedPartIds.includes(part.id));
  };

  const toggleLevel = (runId: number, group: PartLevelGroup) => {
    const selectedPartIds = getSelectedPartIds(runId);
    const levelIds = group.parts.map((part) => part.id);
    if (allLevelSelected(runId, group)) {
      setRunPartIds(
        runId,
        selectedPartIds.filter((id) => !levelIds.includes(id))
      );
      return;
    }

    const next = new Set(selectedPartIds);
    levelIds.forEach((id) => next.add(id));
    setRunPartIds(runId, [...next]);
  };

  return (
    <div>
      <div className="mb-4">
        <h3>Select parent runs</h3>
        <AsyncSelect
          isSearchable={true}
          isClearable={true}
          defaultOptions
          placeholder={"— Select a run, or start typing"}
          loadOptions={loadOptions}
          isLoading={isRunsFetching}
          value={null}
          styles={customStyles}
          onChange={(option) => {
            if (isRunOption(option)) {
              selectRun(option.run);
            }
          }}
        />
      </div>

      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h3 className="mb-0">Selected runs</h3>
          {selectedRuns.length > 0 && (
            <Badge bg="primary" pill className="fw-normal">
              {selectedRuns.length}
            </Badge>
          )}
        </div>

        {selectedRuns.length === 0 && (
          <p className="text-secondary mb-0">Select one or more parent runs to configure their parts.</p>
        )}

        {selectedRuns.length > 0 && (
          <div className="d-flex flex-column gap-2">
            {selectedRuns.map((run) => (
              <div key={run.id} className="d-flex align-items-center justify-content-between gap-3 border rounded p-2">
                <div>
                  <div className="fw-semibold">
                    {run.label} — {run.name}
                  </div>
                  <div className="text-secondary small">Included in creation</div>
                </div>
                <Button variant="outline-danger" size="sm" onClick={() => deselectRun(run.id)}>
                  Deselect
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRuns.length > 0 && (
        <>
          <Nav
            variant="tabs"
            activeKey={visibleRunId === null ? undefined : `run-${visibleRunId}`}
            onSelect={(eventKey) => {
              if (eventKey?.startsWith("run-")) {
                setActiveRunId(Number(eventKey.replace("run-", "")));
              }
            }}
            className="mb-3"
          >
            {selectedRuns.map((run) => (
              <Nav.Item key={run.id}>
                <Nav.Link eventKey={`run-${run.id}`}>{run.label}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          <div className="ms-2 ps-2">
            {selectedRuns.map((run) => {
              if (visibleRunId !== run.id) {
                return null;
              }

              const selectedPartIds = getSelectedPartIds(run.id);
              const partGroups = getPartGroups(run.id);
              const partsQuery = getPartQuery(run.id);

              return (
                <div key={run.id}>
                  <div className="mb-4">
                    <h3>Description</h3>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={descriptionsByRunId[run.id] ?? ""}
                      onChange={(event) => setRunDescription(run.id, event.target.value)}
                      placeholder={`Enter a description for ${run.label}`}
                    />
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h3 className="mb-1">Select parts</h3>
                      <p className="text-secondary mb-0">
                        {run.label} — {run.name}
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {selectedPartIds.length > 0 && (
                        <span className="text-secondary small">{selectedPartIds.length} selected</span>
                      )}
                      <Button variant="link" size="sm" className="p-0" onClick={() => setRunPartIds(run.id, [])}>
                        Clear
                      </Button>
                    </div>
                  </div>

                  {partsQuery?.isFetching && (
                    <div className="d-flex align-items-center gap-2 text-secondary">
                      <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                      <span>Loading parts…</span>
                    </div>
                  )}

                  {!partsQuery?.isFetching && partGroups.length === 0 && (
                    <p className="text-secondary mb-0">This run has no parts to select.</p>
                  )}

                  {!partsQuery?.isFetching &&
                    partGroups.map((group) => (
                      <fieldset key={group.level} className="mb-4 border-0 p-0">
                        <legend className="d-flex align-items-center gap-2 fs-6 fw-semibold mb-2">
                          <span>Level {group.level}</span>
                          <Badge bg="secondary" pill className="fw-normal">
                            {group.parts.length}
                          </Badge>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-1"
                            onClick={() => toggleLevel(run.id, group)}
                          >
                            {allLevelSelected(run.id, group) ? "Deselect all" : "Select all"}
                          </Button>
                        </legend>

                        <div className="d-flex flex-wrap gap-2">
                          {group.parts.map((part) => {
                            const selected = isPartSelected(run.id, part.id);
                            return (
                              <Badge
                                key={part.id}
                                as="button"
                                type="button"
                                bg={selected ? "primary" : "secondary"}
                                onClick={() => togglePart(run.id, part.id)}
                                aria-pressed={selected}
                                title={part.label}
                                className={`border-0 fs-6 fw-normal px-3 py-2${selected ? " step-part-selected" : ""}`}
                                style={{ cursor: "pointer" }}
                              >
                                {part.parsed_label || part.scanner_label || part.label || part.short_label}
                              </Badge>
                            );
                          })}
                        </div>
                      </fieldset>
                    ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
