import React, { useContext, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { Placeholder, Table } from "react-bootstrap";
import {
  listRunParts,
  listRunSteps,
  RunPart,
  RunStep,
} from "@jield/solodb-typescript-core";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import PaginationLinks from "@jield/solodb-react-components/modules/partial/paginationLinks";
import RunLayoutStep from "./elements/runStepInLayout";

export default function RunLayoutElement() {
  const { run } = useContext(RunContext);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(25);
  const [toggledLabels, setToggledLabels] = useState<Map<number, boolean>>(new Map());

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
    ],
  });

  const [runStepsQuery, runPartsQuery] = queries;
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  const runSteps = useMemo(() => (runStepsQuery.data?.items ?? []) as RunStep[], [runStepsQuery.data?.items]);
  const runParts = useMemo(() => (runPartsQuery.data?.items ?? []) as RunPart[], [runPartsQuery.data?.items]);

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

  useEffect(() => {
    if (!isError) return;

    queries
      .filter((query) => query.isError)
      .forEach((query, index) => {
        console.error("RunLayoutElement query error", { index, error: query.error, run });
      });
  }, [isError, queries, run]);

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

  const toggleLabel = (id: number) => {
    setToggledLabels((prev) => {
      const map = new Map(prev);
      map.set(id, !map.get(id));
      return map;
    });
  };

  const renderLabel = (step: RunStep) => {
    const label = step.label;
    const labelId = label?.id;

    if (!step.is_own_label || !label || labelId === undefined) return null;

    return (
      <tr style={{ cursor: "pointer" }} onClick={() => toggleLabel(labelId)}>
        <td colSpan={2} style={{ margin: 0 }} className="bg-secondary">
          <span className="label-toggle">
            <i className={"fa " + (Boolean(toggledLabels.get(step.label?.id ?? -1)) ? "fa-caret-down" : "fa-caret-right")} /> {label.label}
          </span>
        </td>
      </tr>
    );
  };

  const renderGroupHeader = (step: RunStep) => (
    <tr style={{ pointerEvents: "none" }}>
      <td colSpan={2} style={{ margin: 0 }} className="bg-info">
        <span>{step.step_group?.label}</span>
      </td>
    </tr>
  );

  if (isLoading) {
    return (
      <div>
        <h2>Run layout edit</h2>
        <Table borderless hover striped size="sm">
          <thead>
            <tr>
              <th>Step</th>
              <th>Parts</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2].map((group) => (
              <React.Fragment key={group}>
                <tr style={{ pointerEvents: "none" }}>
                  <td colSpan={2} className="bg-info">
                    <Placeholder animation="glow" as="span">
                      <Placeholder style={{ width: "5rem" }} />
                    </Placeholder>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Placeholder animation="glow" as="span">
                      <Placeholder style={{ width: "4rem" }} />
                    </Placeholder>
                  </td>
                  <td>
                    <Placeholder animation="glow" as="div" className="d-flex flex-wrap gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Placeholder key={index} style={{ width: "4.5rem", height: "1.5rem", borderRadius: "3px" }} />
                      ))}
                    </Placeholder>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }

  if (isError) return <div className="text-danger">Error loading run layout.</div>;

  return (
    <div>
      <h2>Run layout edit</h2>
      <Table borderless hover striped size="sm">
        <thead>
          <tr>
            <th>Step</th>
            <th>Parts</th>
          </tr>
        </thead>
        <tbody>
          {runSteps.map((step) => (
            <React.Fragment key={`step-${step.id}`}>
              {step.has_label && renderLabel(step)}
              {(!step.has_label || Boolean(toggledLabels.get(step.label?.id ?? -1))) && (
                <>
                  {step.has_step_group && firstInGroupSteps.includes(step) && renderGroupHeader(step)}
                  <RunLayoutStep
                    key={`step-${step.id}`}
                    step={step}
                    parts={runParts}
                    run={run}
                  />
                </>
              )}
            </React.Fragment>
          ))}
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
