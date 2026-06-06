import { listRuns, Run } from "@jield/solodb-typescript-core";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";

type RunOption = { value: number; label: string };

export default function NewRunWizard() {
  const { environment } = useParams();
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);

  const [runsQuery] = useQueries({
    queries: [
      {
        queryKey: [environment],
        queryFn: () => listRuns({ environment: environment }),
      },
    ],
  });

  const runs: Run[] | null = useMemo(() => runsQuery.data?.items ?? null, [runsQuery]);

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

  return (
    <div>
      <div>
        <h3>Select parent run</h3>
        <AsyncSelect
          isSearchable={true}
          isClearable={true}
          defaultOptions
          placeholder={"— Select a run, or start typing"}
          loadOptions={loadOptions}
          value={currentOption}
          styles={customStyles}
          onChange={(option: any) => {
            setSelectedRun(runs?.find((r) => r.id === option?.value) ?? null);
          }}
        />
      </div>
    </div>
  );
}
