import React, { useMemo } from "react";
import { Table } from "react-bootstrap";
import { useQueries } from "@tanstack/react-query";
import ListRunParts from "@/modules/run/api/listRunParts";
import { RunPart } from "@/modules/run/interfaces/run/runPart";
import RunPartProductionTableRow from "@/modules/run/components/step/view/element/parts/element/runPartProductionTableRow";
import ListRunStepParts from "@/modules/run/api/step/listRunStepParts";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { Run } from "@/modules/run/interfaces/run";
import { RunStepPart } from "@/modules/run/interfaces/step/runStepPart";

const RunPartsProductionRun = ({
  run,
  runStep,
  runStepParts,
  runParts,
  refetchFn = () => {},
}: {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  runParts?: RunPart[];
  refetchFn?: () => void;
}) => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ["runParts", run],
        queryFn: () => ListRunParts({ run: run }),
        enabled: !runParts, // don't fetch if runParts prop provided
      },
      {
        queryKey: ["runStepParts", runStep],
        queryFn: () => ListRunStepParts({ step: runStep }),
        enabled: !runStepParts, // don't fetch if runStepParts prop provided
      },
    ],
  });

  const [runPartQuery, runStepPartsQuery] = queries;

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const runPartsData = useMemo<RunPart[]>(
    () => runParts ?? (runPartQuery.data?.items as RunPart[] | undefined) ?? [],
    [runParts, runPartQuery.data]
  );

  const runStepPartsData = useMemo<RunStepPart[]>(
    () => runStepParts ?? (runStepPartsQuery.data?.items as RunStepPart[] | undefined) ?? [],
    [runStepParts, runStepPartsQuery.data]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div className="text-danger">Error loading run parts.</div>;
  }

  const leveledParts = runPartsData.filter((part) => part.part_level === runStep.part_level);

  return (
    <React.Fragment>
      {leveledParts.length > 0 && (
        <>
          <h3>Available parts</h3>
          <Table size={"sm"} striped hover responsive className={"align-middle"}>
            <thead>
              <tr>
                <th>Part</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {leveledParts.map((runPart: RunPart, i: React.Key) => (
                <RunPartProductionTableRow
                  runStep={runStep}
                  runPart={runPart}
                  runStepParts={runStepPartsData}
                  refetchFn={refetchFn}
                  key={i}
                />
              ))}
            </tbody>
          </Table>
        </>
      )}
    </React.Fragment>
  );
};

export default RunPartsProductionRun;
