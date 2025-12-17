import React, { useContext, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PaginationLinks from "@/modules/partial/paginationLinks";
import StepElement from "@/modules/run/components/step/view/element/step-overview/stepElement";
import RequirementElement from "@/modules/run/components/step/view/element/step-overview/requirementElement";
import { listRunParts, listRunStepParts, listRunSteps, listRequirements, Requirement, RunStep } from "solodb-typescript-core";

const RunStepSimpleList = ({ pageSize = 25, hideLabel = false }: { pageSize?: number; hideLabel?: boolean }) => {
  const { runStep, run } = useContext(RunStepContext);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (runStep?.sequence) {
      setPage(Math.max(1, Math.ceil(runStep.sequence / pageSize)));
    }
  }, [runStep?.sequence, pageSize]);

  const runId = run?.id ?? null;

  const runPartsQuery = useQuery({
    queryKey: ["runParts", `${runId}`],
    queryFn: () => listRunParts({ run }),
    enabled: !!runId,
  });

  const runStepPartsQuery = useQuery({
    queryKey: ["runStepParts", `${runId}`],
    queryFn: () => listRunStepParts({ run }),
    enabled: !!runId,
  });

  const runStepsQuery = useQuery({
    queryKey: ["runSteps", runId, page, pageSize],
    queryFn: () => listRunSteps({ run, page, pageSize }),
    enabled: !!runId,
    placeholderData: keepPreviousData,
  });

  const requirementsQuery = useQuery({
    queryKey: ["requirements", runId],
    queryFn: () => listRequirements({ run }),
    enabled: !!runId,
    placeholderData: keepPreviousData,
  });

  const isLoading =
    runPartsQuery.isLoading || runStepPartsQuery.isLoading || runStepsQuery.isLoading || requirementsQuery.isLoading;
  const isError =
    runPartsQuery.isError || runStepPartsQuery.isError || runStepsQuery.isError || requirementsQuery.isError;
  const error = runPartsQuery.error || runStepPartsQuery.error || runStepsQuery.error || requirementsQuery.error;

  const runParts = runPartsQuery.data?.items ?? [];
  const runStepParts = runStepPartsQuery.data?.items ?? [];
  const steps = runStepsQuery.data?.items ?? [];
  const requirements = requirementsQuery.data?.items ?? [];

  const seenGroups = new Set<string>();
  const firstInGroupSteps = steps.filter((step) => {
    if (!step.has_step_group || typeof step.step_group?.id !== "number") {
      return false;
    }
    if (seenGroups.has(String(step.step_group.id))) {
      return false;
    }
    seenGroups.add(String(step.step_group.id));
    return true;
  });

  const monitoredSteps: { [key: string]: Requirement } = {};
  for (const r of requirements) {
    if (r.requirement_for_step != null) {
      monitoredSteps[String(r.requirement_for_step.id)] = r;
    }
  }

  // Log errors when any query fails
  React.useEffect(() => {
    if (isError) {
      console.error("RunStepSimpleList query error", {
        runId,
        errors: [runPartsQuery.error, runStepPartsQuery.error, runStepsQuery.error, requirementsQuery.error],
      });
    }
  }, [isError, runId, runPartsQuery.error, runStepPartsQuery.error, runStepsQuery.error, requirementsQuery.error]);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {String((error as any)?.message ?? error)}</div>
      ) : (
        <Table size="sm" striped bordered hover>
          <tbody>
            {steps.map((step: RunStep, idx: number) => (
              <React.Fragment key={idx}>
                {step.has_requirement ? (
                  (() => {
                    const requirement = requirements.find((r) => r.step.id === step.id) as Requirement;
                    return (
                      <RequirementElement
                        key={step.id ?? step.sequence ?? idx}
                        requirement={requirement}
                        runParts={runParts}
                        runStepParts={runStepParts}
                        firstInGroup={firstInGroupSteps.includes(step)}
                      />
                    );
                  })()
                ) : (
                  <StepElement
                    run={run}
                    key={step.id ?? step.sequence ?? idx}
                    monitoredBy={monitoredSteps[step.id]}
                    runParts={runParts}
                    runStepParts={runStepParts}
                    hideLabel={hideLabel}
                    firstInGroup={firstInGroupSteps.includes(step)}
                    runStep={step}
                  />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      )}
      <PaginationLinks
        data={runStepsQuery.data as any}
        setPage={setPage}
        isPlaceholderData={runStepsQuery.isPlaceholderData}
      />
      {runStepsQuery.isFetching ? <span> Loading...</span> : null}
    </div>
  );
};

export default RunStepSimpleList;
