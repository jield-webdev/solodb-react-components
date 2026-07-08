import React, { useContext, useEffect, useState } from "react";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PaginationLinks from "@jield/solodb-react-components/modules/partial/paginationLinks";
import StepElement from "@jield/solodb-react-components/modules/run/components/step/view/element/step-overview/stepElement";
import RequirementElement from "@jield/solodb-react-components/modules/run/components/step/view/element/step-overview/requirementElement";
import {
  listRunParts,
  listRunStepParts,
  listRunSteps,
  listRequirements,
  Requirement,
  RunStep,
} from "@jield/solodb-typescript-core";

const RunStepSimpleList = ({ pageSize = 25, hideLabel = false }: { pageSize?: number; hideLabel?: boolean }) => {
  const { runStep, run } = useContext(RunStepContext);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (runStep?.sequence) {
      setPage(Math.max(1, Math.ceil(runStep.sequence / pageSize)));
    }
  }, [runStep?.sequence, pageSize]);

  const runId = run?.id ?? null;

  const {
    data: runPartsData,
    error: runPartsError,
    isError: isRunPartsError,
    isLoading: isRunPartsLoading,
  } = useQuery({
    queryKey: ["runParts", `${runId}`],
    queryFn: () => listRunParts({ run }),
    enabled: !!runId,
  });

  const {
    data: runStepPartsData,
    error: runStepPartsError,
    isError: isRunStepPartsError,
    isLoading: isRunStepPartsLoading,
  } = useQuery({
    queryKey: ["runStepParts", `${runId}`],
    queryFn: () => listRunStepParts({ run }),
    enabled: !!runId,
  });

  const {
    data: runStepsData,
    error: runStepsError,
    isError: isRunStepsError,
    isFetching: isRunStepsFetching,
    isLoading: isRunStepsLoading,
    isPlaceholderData: isRunStepsPlaceholderData,
  } = useQuery({
    queryKey: ["runSteps", runId, page, pageSize],
    queryFn: () => listRunSteps({ run, page, pageSize }),
    enabled: !!runId,
    placeholderData: keepPreviousData,
  });

  const {
    data: requirementsData,
    error: requirementsError,
    isError: isRequirementsError,
    isLoading: isRequirementsLoading,
  } = useQuery({
    queryKey: ["requirements", runId],
    queryFn: () => listRequirements({ run }),
    enabled: !!runId,
    placeholderData: keepPreviousData,
  });

  const isLoading =
    isRunPartsLoading || isRunStepPartsLoading || isRunStepsLoading || isRequirementsLoading;
  const isError =
    isRunPartsError || isRunStepPartsError || isRunStepsError || isRequirementsError;
  const error = runPartsError || runStepPartsError || runStepsError || requirementsError;

  const runParts = runPartsData?.items ?? [];
  const runStepParts = runStepPartsData?.items ?? [];
  const steps = runStepsData?.items ?? [];
  const requirements = requirementsData?.items ?? [];

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
        errors: [runPartsError, runStepPartsError, runStepsError, requirementsError],
      });
    }
  }, [isError, runId, runPartsError, runStepPartsError, runStepsError, requirementsError]);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {String((error as any)?.message ?? error)}</div>
      ) : (
        <div className="d-flex flex-column gap-2">
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
        </div>
      )}
      <PaginationLinks
        data={runStepsData as any}
        setPage={setPage}
        isPlaceholderData={isRunStepsPlaceholderData}
      />
      {isRunStepsFetching ? <span> Loading...</span> : null}
    </div>
  );
};

export default RunStepSimpleList;
