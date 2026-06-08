import { listRunParts, listRuns, type Run, type RunPart } from "@jield/solodb-typescript-core";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { Badge, Button, Form, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";

type RunOption = { value: number; label: string };

type PartLevelGroup = { level: number; parts: RunPart[] };

type RunSelectProps = {
  selectedRun: Run | null;
  setSelectedRun: (selectedRun: Run | null) => void;
  selectedPartIds: number[];
  setSelectedPartIds: (selectedPartIds: number[]) => void;
  description: string;
  setDescription: (description: string) => void;
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

  return [...byLevel.entries()]
    .sort(([levelA], [levelB]) => levelA - levelB)
    .map(([level, levelParts]) => ({ level, parts: [...levelParts].sort(sortParts) }));
};

const isRunOption = (option: unknown): option is RunOption => {
  return (
    typeof option === "object" &&
    option !== null &&
    "value" in option &&
    typeof (option as { value?: unknown }).value === "number"
  );
};

export default function RunSelect({
  selectedRun,
  setSelectedRun,
  selectedPartIds,
  setSelectedPartIds,
  description,
  setDescription,
}: RunSelectProps) {
  const { environment } = useParams();

  const [runsQuery, partsQuery] = useQueries({
    queries: [
      {
        queryKey: [environment],
        queryFn: () => listRuns({ environment: environment }),
      },
      {
        queryKey: [selectedRun?.id],
        queryFn: () => (selectedRun ? listRunParts({ run: selectedRun }) : null),
      },
    ],
  });

  const runs: Run[] | null = useMemo(() => runsQuery.data?.items ?? null, [runsQuery]);

  const parts: RunPart[] | null = useMemo(() => partsQuery.data?.items ?? null, [partsQuery]);

  const partGroups: PartLevelGroup[] = useMemo(() => groupPartsByLevel(parts ?? []), [parts]);

  // listRuns has no server-side query param, so filter the already-loaded runs client-side.
  const loadOptions = (inputValue: string, callback: (options: RunOption[]) => void) => {
    const query = inputValue.toLowerCase();
    const options = (runs ?? [])
      .filter((r) => !query || r.label.toLowerCase().includes(query) || r.name.toLowerCase().includes(query))
      .map((r) => ({ value: r.id, label: `${r.label} — ${r.name}` }));
    callback(options);
  };

  const currentOption: RunOption | null = selectedRun
    ? { value: selectedRun.id, label: `${selectedRun.label} — ${selectedRun.name}` }
    : null;

  const isPartSelected = (id: number): boolean => selectedPartIds.includes(id);

  const togglePart = (id: number) => {
    setSelectedPartIds(
      selectedPartIds.includes(id) ? selectedPartIds.filter((partId) => partId !== id) : [...selectedPartIds, id]
    );
  };

  const allLevelSelected = (group: PartLevelGroup): boolean =>
    group.parts.length > 0 && group.parts.every((part) => selectedPartIds.includes(part.id));

  const toggleLevel = (group: PartLevelGroup) => {
    const levelIds = group.parts.map((part) => part.id);
    if (allLevelSelected(group)) {
      setSelectedPartIds(selectedPartIds.filter((id) => !levelIds.includes(id)));
      return;
    }

    const next = new Set(selectedPartIds);
    levelIds.forEach((id) => next.add(id));
    setSelectedPartIds([...next]);
  };

  return (
    <div>
      <div className="mb-4">
        <h3>Select parent run</h3>
        <AsyncSelect
          isSearchable={true}
          isClearable={true}
          defaultOptions
          placeholder={"— Select a run, or start typing"}
          loadOptions={loadOptions}
          value={currentOption}
          styles={customStyles}
          onChange={(option) => {
            setSelectedRun(isRunOption(option) ? (runs?.find((r) => r.id === option.value) ?? null) : null);
            setSelectedPartIds([]);
          }}
        />
      </div>

      <div className="mb-4">
        <h3>Description</h3>
        <Form.Control
          as="textarea"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter a description for this run"
        />
      </div>

      {selectedRun && (
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h3 className="mb-0">Select parts</h3>
            {selectedPartIds.length > 0 && (
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small">{selectedPartIds.length} selected</span>
                <Button variant="link" size="sm" className="p-0" onClick={() => setSelectedPartIds([])}>
                  Clear
                </Button>
              </div>
            )}
          </div>

          {partsQuery.isFetching && (
            <div className="d-flex align-items-center gap-2 text-secondary">
              <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
              <span>Loading parts…</span>
            </div>
          )}

          {!partsQuery.isFetching && partGroups.length === 0 && (
            <p className="text-secondary mb-0">This run has no parts to select.</p>
          )}

          {!partsQuery.isFetching &&
            partGroups.map((group) => (
              <fieldset key={group.level} className="mb-4 border-0 p-0">
                <legend className="d-flex align-items-center gap-2 fs-6 fw-semibold mb-2">
                  <span>Level {group.level}</span>
                  <Badge bg="secondary" pill className="fw-normal">
                    {group.parts.length}
                  </Badge>
                  <Button variant="link" size="sm" className="p-0 ms-1" onClick={() => toggleLevel(group)}>
                    {allLevelSelected(group) ? "Deselect all" : "Select all"}
                  </Button>
                </legend>

                <div className="d-flex flex-wrap gap-2">
                  {group.parts.map((part) => {
                    const selected = isPartSelected(part.id);
                    return (
                      <Badge
                        key={part.id}
                        as="button"
                        type="button"
                        bg={selected ? "primary" : "secondary"}
                        onClick={() => togglePart(part.id)}
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
      )}
    </div>
  );
}
