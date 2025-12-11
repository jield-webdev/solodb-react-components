import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import ListRunStepParts from "@/modules/run/api/step/listRunStepParts";
import { RunStepPart } from "@/modules/run/interfaces/step/runStepPart";
import RunStepPartTableRow from "@/modules/run/components/shared/parts/runStepPartTableRow";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { Run } from "@/modules/run/interfaces/run";

const RunPartsResearchRun = ({
  run,
  runStep,
  runStepParts,
  editable = true,
  refetchFn = () => {},
}: {
  run: Run;
  runStep: RunStep;
  runStepParts?: RunStepPart[];
  editable?: boolean;
  refetchFn?: () => void;
}) => {
  const [stepParts, setStepParts] = useState<RunStepPart[]>(runStepParts || []);

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["stepParts", runStep],
    queryFn: () => ListRunStepParts({ step: runStep }),
    enabled: !runStepParts, // Only run the query if runStepParts is not provided
  });

  useEffect(() => {
    if (isError) {
      console.error("RunPartsResearchRun query error", { error, runStep });
    }
  }, [isError, error, runStep]);

  useEffect(() => {
    if (!isLoading && data && !runStepParts) {
      setStepParts(data.items);
    }
  }, [isLoading, data, runStepParts]);

  useEffect(() => {
    if (runStepParts) {
      setStepParts(runStepParts);
    }
  }, [runStepParts]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div className="text-danger">Error loading run parts.</div>;
  }

  if (stepParts.length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      {stepParts && stepParts.length > 0 && (
        <>
          <Table size={"sm"} striped bordered>
            <thead>
              <tr>
                <th>Part</th>
                <th className={"text-center"}>Status</th>
                {editable && <th className={"text-center"}>Operation</th>}
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {stepParts.map((stepPart: RunStepPart, i: React.Key) => (
                <RunStepPartTableRow editable={editable} runStepPart={stepPart} key={i} reloadFn={refetchFn} />
              ))}
            </tbody>
          </Table>
        </>
      )}
    </React.Fragment>
  );
};

export default RunPartsResearchRun;

