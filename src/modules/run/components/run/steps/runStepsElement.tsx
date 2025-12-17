import React, { useContext, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQueries, useQueryClient } from "@tanstack/react-query";
import { Table } from "react-bootstrap";

import { RunContext } from "@/modules/run/contexts/runContext";
import PaginationLinks from "@/modules/partial/paginationLinks";
import { EmphasizedParametersContext } from "@/modules/run/contexts/emphasizedParametersContext";
import StepInList from "@/modules/run/components/run/steps/element/stepInList";
import RequirementStepInList from "@/modules/run/components/run/steps/element/requirementStepInList";
import { listRunSteps, listRunParts, listRunStepParts, listRequirements, RunStep, RunPart, RunStepPart, Requirement } from "solodb-typescript-core";

export default function RunStepsElement() {
  const { run } = useContext(RunContext);
  const { showOnlyEmphasizedParameters, setShowOnlyEmphasizedParameters } = useContext(EmphasizedParametersContext);

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);

  const [toggledLabels, setToggledLabels] = useState<Map<number, boolean>>(new Map());

  const queryClient = useQueryClient();
  const queries = useQueries({
    queries: [
      {
        queryKey: ["runSteps", JSON.stringify(run), page],
        queryFn: () => listRunSteps({ run, page, pageSize }),
        placeholderData: keepPreviousData,
      },
      {
        queryKey: ["runParts", JSON.stringify(run)],
        queryFn: () => listRunParts({ run }),
      },
      {
        queryKey: ["runStepParts", JSON.stringify(run)],
        queryFn: () => listRunStepParts({ run }),
      },
      {
        queryKey: ["requirements", JSON.stringify(run)],
        queryFn: () => listRequirements({ run: run }),
      },
    ],
  });

  const reloadQueriesByKey = (key: any[]) => {
    const finalKeys = [...key, JSON.stringify(run)];
    if (key[0] === "runSteps") {
      finalKeys.push(page);
    }
    queryClient.refetchQueries({ queryKey: finalKeys });
  };

  const [runStepsQuery, runPartQuery, runStepPartsQuery, requirementsQuery] = queries;

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  if (isError) {
    queries
      .filter((q) => q.isError)
      .forEach((q, idx) => {
        console.error("RunStepsElement query error", { index: idx, error: q.error, run });
      });
  }

  const runSteps = useMemo(() => (runStepsQuery.data?.items ?? []) as RunStep[], [runStepsQuery.data?.items]);
  const runParts = useMemo(() => (runPartQuery.data?.items ?? []) as RunPart[], [runPartQuery.data?.items]);
  const runStepParts = useMemo(
    () => (runStepPartsQuery.data?.items ?? []) as RunStepPart[],
    [runStepPartsQuery.data?.items]
  );
  const requirements = useMemo(
    () => (requirementsQuery.data?.items ?? []) as Requirement[],
    [requirementsQuery.data?.items]
  );

  useEffect(() => {
    setToggledLabels((prev) => {
      const map = new Map(prev);
      runSteps.forEach((step) => {
        const labelId = step.label?.id;
        if (labelId !== undefined && !map.has(labelId)) {
          map.set(labelId, true);
        }
      });
      return map;
    });
  }, [runSteps]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-danger">Error loading run steps.</div>;

  const seenGroups = new Set<string>();
  const firstInGroupSteps = runSteps.filter((step) => {
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

  const renderGroupHeader = (step: RunStep) => (
    <tr style={{ pointerEvents: "none" }}>
      <td colSpan={5} style={{ margin: 0 }} className="bg-info">
        <span>{step.step_group?.label}</span>
      </td>
    </tr>
  );

  const renderLabel = (step: RunStep) => {
    const label = step.label;
    const labelId = label?.id;

    if (!step.is_own_label || !label || labelId === undefined) return null;

    const toggleLabel = (id: number) => {
      setToggledLabels((prev) => {
        const map = new Map(prev);
        map.set(id, !map.get(id));
        return map;
      });
    };

    return (
      <tr style={{ cursor: "pointer" }} onClick={() => toggleLabel(labelId)}>
        <td colSpan={5} style={{ margin: 0 }} className="bg-secondary">
          <span className="label-toggle">
            <i className={"fa " + (toggledLabels.get(step.label?.id ?? -1) ? "fa-caret-down" : "fa-caret-right")} />{" "}
            {label.label}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <h2>Run steps</h2>
      <div className="d-flex justify-content-between align-items-center">
        <div className="form-check form-switch">
          <input
            type="checkbox"
            checked={showOnlyEmphasizedParameters}
            className="form-check-input"
            data-toggle="toggle"
            onChange={() => setShowOnlyEmphasizedParameters(!showOnlyEmphasizedParameters)}
          />
          <label className="ms-2">Show only emphasized parameters</label>
        </div>
      </div>

      <Table borderless hover striped size={"sm"}>
        <thead>
          <tr>
            <th></th>
            <th>Parts</th>
            <th></th>
            <th>Process</th>
            <th>Equipment</th>
          </tr>
        </thead>
        <tbody>
          {runSteps.map((step, i) => {
            const key = `step-${step.id}`;
            return (
              <React.Fragment key={key}>
                {step.has_label && renderLabel(step)}
                {(!step.has_label || toggledLabels.get(step.label?.id ?? -1)) && (
                  <>
                    {step.has_step_group && firstInGroupSteps.includes(step) && renderGroupHeader(step)}
                    {step.has_requirement ? (
                      (() => {
                        const requirement = requirements.find((r) => r.step.id === step.id) as Requirement;
                        return (
                          <RequirementStepInList
                            requirement={requirement}
                            step={step}
                            parts={runParts}
                            stepParts={runStepParts.filter(
                              (part) => part.step.id === (requirement.requirement_for_step?.id ?? requirement.step.id)
                            )}
                            refetchFn={reloadQueriesByKey}
                          />
                        );
                      })()
                    ) : (
                      <StepInList
                        run={run}
                        step={step}
                        parts={runParts}
                        stepParts={runStepParts.filter((part) => part.step.id === step.id)}
                        monitoredBy={monitoredSteps[step.id]}
                        refetchFn={reloadQueriesByKey}
                      />
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>

      <PaginationLinks
        data={runStepsQuery.data!}
        setPage={setPage}
        isPlaceholderData={runStepsQuery.isPlaceholderData}
      />
    </div>
  );
}
