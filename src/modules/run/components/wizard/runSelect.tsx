import { listRunParts, listRuns, type Run, type RunPart } from "@jield/solodb-typescript-core";
import { useQueries, useQuery } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from "react";
import { Badge, Button, Form, Nav, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";

type RunOption = { value: number; label: string; run: Run };

type PartLevelGroup = { level: number; parts: RunPart[] };

type RunSelectProps = {
  selectedRuns: Run[];
  setSelectedRuns: Dispatch<SetStateAction<Run[]>>;
  selectedPartIdsByRunId: Record<number, number[]>;
  setSelectedPartIdsByRunId: Dispatch<SetStateAction<Record<number, number[]>>>;
  amountPerPartByRunId: Record<number, Record<number, number>>;
  setAmountPerPartByRunId: Dispatch<SetStateAction<Record<number, Record<number, number>>>>;
  descriptionsByRunId: Record<number, string>;
  setDescriptionsByRunId: Dispatch<SetStateAction<Record<number, string>>>;
};

const emptySelectedPartIds = new Set<number>();
const emptyRuns: Run[] = [];

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

const getPartLabel = (part: RunPart): string => {
  return part.parsed_label || part.scanner_label || part.label || part.short_label;
};

export default function RunSelect({
  selectedRuns,
  setSelectedRuns,
  selectedPartIdsByRunId,
  setSelectedPartIdsByRunId,
  amountPerPartByRunId,
  setAmountPerPartByRunId,
  descriptionsByRunId,
  setDescriptionsByRunId,
}: RunSelectProps) {
  const { environment } = useParams();
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [experimentalEdit, setExperimentalEdit] = useState(false);

  const { data: runsData, isFetching: isRunsFetching } = useQuery({
    queryKey: [environment],
    queryFn: () => listRuns({ environment: environment }),
  });

  const partQueryOptions = useMemo(
    () =>
      selectedRuns.map((run) => ({
        queryKey: [run.id],
        queryFn: () => listRunParts({ run }),
        select: (data: Awaited<ReturnType<typeof listRunParts>>) => ({
          partGroups: groupPartsByLevel(data.items ?? []),
        }),
      })),
    [selectedRuns]
  );

  const partQueries = useQueries({
    queries: partQueryOptions,
  });

  const runs: Run[] = runsData?.items ?? emptyRuns;
  const selectedRunIds = useMemo(() => new Set(selectedRuns.map((run) => run.id)), [selectedRuns]);
  const visibleRunId =
    activeRunId !== null && selectedRunIds.has(activeRunId) ? activeRunId : (selectedRuns[0]?.id ?? null);
  const visibleRun = visibleRunId === null ? null : (selectedRuns.find((run) => run.id === visibleRunId) ?? null);
  const { partQueryByRunId, partGroupsByRunId } = useMemo(() => {
    const queryByRunId: Partial<Record<number, (typeof partQueries)[number]>> = {};
    const groupsByRunId: Record<number, PartLevelGroup[]> = {};

    selectedRuns.forEach((run, index) => {
      const partQuery = partQueries[index];
      if (partQuery) {
        queryByRunId[run.id] = partQuery;
      }
      groupsByRunId[run.id] = partQuery?.data?.partGroups ?? [];
    });

    return { partQueryByRunId: queryByRunId, partGroupsByRunId: groupsByRunId };
  }, [partQueries, selectedRuns]);

  const selectedPartIdSetsByRunId = useMemo(() => {
    const selectedPartIds: Record<number, Set<number>> = {};

    for (const [runId, partIds] of Object.entries(selectedPartIdsByRunId)) {
      selectedPartIds[Number(runId)] = new Set(partIds);
    }

    return selectedPartIds;
  }, [selectedPartIdsByRunId]);

  // listRuns has no server-side query param, so filter the already-loaded runs client-side.
  const loadOptions = useCallback(
    (inputValue: string, callback: (options: RunOption[]) => void) => {
      const query = inputValue.toLowerCase();
      const options: RunOption[] = [];

      for (const run of runs) {
        if (!query || run.label.toLowerCase().includes(query) || run.name.toLowerCase().includes(query)) {
          options.push({ value: run.id, label: `${run.label} — ${run.name}`, run });
        }
      }

      callback(options);
    },
    [runs]
  );

  const setRunPartIds = (runId: number, partIds: number[]) => {
    setSelectedPartIdsByRunId((current) => {
      const currentPartIds = current[runId] ?? [];
      const hasSamePartIds =
        currentPartIds.length === partIds.length && currentPartIds.every((partId, index) => partId === partIds[index]);

      if (hasSamePartIds) {
        return current;
      }

      if (partIds.length === 0 && !(runId in current)) {
        return current;
      }

      const next = { ...current };
      if (partIds.length > 0) {
        next[runId] = partIds;
      } else {
        delete next[runId];
      }
      return next;
    });
  };

  const getPartAmount = (runId: number, partId: number): number => amountPerPartByRunId[runId]?.[partId] ?? 1;

  const setRunPartAmount = (runId: number, partId: number, amount: number) => {
    const sanitizedAmount = Number.isFinite(amount) ? Math.max(1, amount) : 1;
    setAmountPerPartByRunId((current) => {
      if ((current[runId]?.[partId] ?? 1) === sanitizedAmount) {
        return current;
      }

      return {
        ...current,
        [runId]: {
          ...(current[runId] ?? {}),
          [partId]: sanitizedAmount,
        },
      };
    });
  };

  const clearRunPartAmounts = (runId: number) => {
    setAmountPerPartByRunId((current) => {
      if (!(runId in current)) {
        return current;
      }

      const next = { ...current };
      delete next[runId];
      return next;
    });
  };

  const setRunDescription = (runId: number, description: string) => {
    setDescriptionsByRunId((current) => {
      if ((current[runId] ?? "") === description) {
        return current;
      }

      if (!description && !(runId in current)) {
        return current;
      }

      const next = { ...current };
      if (description) {
        next[runId] = description;
      } else {
        delete next[runId];
      }
      return next;
    });
  };

  const selectRun = (run: Run) => {
    setSelectedRuns((current) =>
      current.some((selectedRun) => selectedRun.id === run.id) ? current : [...current, run]
    );
    setActiveRunId(run.id);
  };

  const deselectRun = (runId: number) => {
    const nextSelectedRuns = selectedRuns.filter((run) => run.id !== runId);
    setSelectedRuns(nextSelectedRuns);
    setRunPartIds(runId, []);
    clearRunPartAmounts(runId);
    setRunDescription(runId, "");

    if (activeRunId === runId) {
      setActiveRunId(nextSelectedRuns[0]?.id ?? null);
    }
  };

  const getSelectedPartIds = (runId: number): number[] => selectedPartIdsByRunId[runId] ?? [];

  const getSelectedPartIdSet = (runId: number): Set<number> => selectedPartIdSetsByRunId[runId] ?? emptySelectedPartIds;

  const isPartSelected = (runId: number, id: number): boolean => getSelectedPartIdSet(runId).has(id);

  const togglePart = (runId: number, id: number) => {
    const selectedPartIds = getSelectedPartIds(runId);
    const selectedPartIdSet = getSelectedPartIdSet(runId);
    setRunPartIds(
      runId,
      selectedPartIdSet.has(id) ? selectedPartIds.filter((partId) => partId !== id) : [...selectedPartIds, id]
    );
  };

  const allLevelSelected = (runId: number, group: PartLevelGroup): boolean => {
    const selectedPartIdSet = getSelectedPartIdSet(runId);
    return group.parts.length > 0 && group.parts.every((part) => selectedPartIdSet.has(part.id));
  };

  const toggleLevel = (runId: number, group: PartLevelGroup) => {
    const selectedPartIds = getSelectedPartIds(runId);
    const levelIds = new Set(group.parts.map((part) => part.id));
    if (allLevelSelected(runId, group)) {
      setRunPartIds(
        runId,
        selectedPartIds.filter((id) => !levelIds.has(id))
      );
      return;
    }

    const next = new Set(selectedPartIds);
    levelIds.forEach((id) => next.add(id));
    setRunPartIds(runId, [...next]);
  };

  const visibleSelectedPartIds = visibleRun ? getSelectedPartIds(visibleRun.id) : [];
  const visiblePartGroups = visibleRun ? (partGroupsByRunId[visibleRun.id] ?? []) : [];
  const visiblePartsQuery = visibleRun ? partQueryByRunId[visibleRun.id] : undefined;

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
              <div key={run.id} className="d-flex flex-column gap-2 bg-body-secondary rounded p-2">
                <div>
                  <div className="fw-semibold">
                    {run.label} — {run.name}
                  </div>
                  <div className="text-secondary small">Included in creation</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button variant="outline-danger" size="sm" onClick={() => deselectRun(run.id)}>
                    Deselect
                  </Button>
                </div>
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
            {visibleRun && (
              <div key={visibleRun.id}>
                <div className="mb-4">
                  <h3>Description</h3>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={descriptionsByRunId[visibleRun.id] ?? ""}
                    onChange={(event) => setRunDescription(visibleRun.id, event.target.value)}
                    placeholder={`Enter a description for ${visibleRun.label}`}
                  />
                </div>

                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h3 className="mb-1">Select parts</h3>
                    <Button
                      variant={experimentalEdit ? "outline-primary" : "primary"}
                      size="sm"
                      onClick={() => setExperimentalEdit((isEditing) => !isEditing)}
                      aria-pressed={experimentalEdit}
                    >
                      {experimentalEdit ? "Done editing split" : "Edit experimental split"}
                    </Button>
                    {experimentalEdit && <p className="text-secondary small mb-0 mt-1">Amounts must be 1 or higher.</p>}

                    <p className="text-secondary mb-0">
                      {visibleRun.label} — {visibleRun.name}
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {visibleSelectedPartIds.length > 0 && (
                      <span className="text-secondary small">{visibleSelectedPartIds.length} selected</span>
                    )}
                    <Button variant="link" size="sm" className="p-0" onClick={() => setRunPartIds(visibleRun.id, [])}>
                      Clear
                    </Button>
                  </div>
                </div>

                {visiblePartsQuery?.isFetching && (
                  <div className="d-flex align-items-center gap-2 text-secondary">
                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                    <span>Loading parts…</span>
                  </div>
                )}

                {!visiblePartsQuery?.isFetching && visiblePartGroups.length === 0 && (
                  <p className="text-secondary mb-0">This run has no parts to select.</p>
                )}

                {!visiblePartsQuery?.isFetching &&
                  visiblePartGroups.map((group) => (
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
                          onClick={() => toggleLevel(visibleRun.id, group)}
                        >
                          {allLevelSelected(visibleRun.id, group) ? "Deselect all" : "Select all"}
                        </Button>
                      </legend>

                      {experimentalEdit ? (
                        <div className="list-group">
                          {group.parts.map((part) => {
                            const selected = isPartSelected(visibleRun.id, part.id);
                            const partLabel = getPartLabel(part);
                            const amountInputId = `part-amount-${visibleRun.id}-${part.id}`;
                            const selectedInputId = `part-selected-${visibleRun.id}-${part.id}`;

                            return (
                              <div
                                key={part.id}
                                className={`list-group-item d-flex align-items-center gap-3 flex-wrap${
                                  selected ? " border-primary border-top" : ""
                                }`}
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <Form.Label htmlFor={amountInputId} className="small text-secondary mb-0">
                                    Split
                                  </Form.Label>
                                  <Form.Control
                                    id={amountInputId}
                                    type="number"
                                    size="sm"
                                    min={1}
                                    step="any"
                                    inputMode="decimal"
                                    value={getPartAmount(visibleRun.id, part.id)}
                                    onChange={(event) =>
                                      setRunPartAmount(visibleRun.id, part.id, Number(event.target.value))
                                    }
                                    aria-label={`Experimental split amount for ${partLabel}`}
                                    style={{ maxWidth: "7rem" }}
                                  />
                                </div>
                                <label
                                  htmlFor={selectedInputId}
                                  className="flex-grow-1 mb-0"
                                  style={{ cursor: "pointer" }}
                                >
                                  {partLabel}
                                </label>
                                <Form.Check
                                  id={selectedInputId}
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => togglePart(visibleRun.id, part.id)}
                                  aria-label={`Select ${partLabel}`}
                                  className="ms-sm-auto"
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {group.parts.map((part) => {
                            const selected = isPartSelected(visibleRun.id, part.id);
                            return (
                              <Badge
                                key={part.id}
                                as="button"
                                type="button"
                                bg={selected ? "primary" : "dark"}
                                onClick={() => togglePart(visibleRun.id, part.id)}
                                aria-pressed={selected}
                                title={part.label}
                                className={`border-0 fs-6 fw-normal px-3 py-2${selected ? " step-part-selected" : ""}`}
                                style={{ cursor: "pointer" }}
                              >
                                {getPartLabel(part)}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </fieldset>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
