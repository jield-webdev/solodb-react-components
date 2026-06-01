import React, { useContext, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Placeholder, Table } from "react-bootstrap";
import {
  listRunParts,
  listRunStepParts,
  listRunSteps,
  RunPart,
  RunStep,
  RunStepPart,
} from "@jield/solodb-typescript-core";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import { RunLayoutPartList } from "./runLayoutPartList";

const PAGE_SIZE = 1000;

export default function RunLayoutElement() {
  const { run } = useContext(RunContext);
  const { environment } = useParams();
  const [toggledLabels, setToggledLabels] = useState<Map<number, boolean>>(new Map());

  const queries = useQueries({
    queries: [
      {
        queryKey: ["runSteps", JSON.stringify(run), "layout"],
        queryFn: () => listRunSteps({ run, page: 1, pageSize: PAGE_SIZE }),
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
    ],
  });

  const [runStepsQuery, runPartsQuery, runStepPartsQuery] = queries;
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  const runSteps = useMemo(() => (runStepsQuery.data?.items ?? []) as RunStep[], [runStepsQuery.data?.items]);
  const runParts = useMemo(() => (runPartsQuery.data?.items ?? []) as RunPart[], [runPartsQuery.data?.items]);
  const runStepParts = useMemo(
    () => (runStepPartsQuery.data?.items ?? []) as RunStepPart[],
    [runStepPartsQuery.data?.items]
  );

  const runStepPartsByStepId = useMemo(() => {
    return runStepParts.reduce<Map<number, RunStepPart[]>>((acc, stepPart) => {
      const list = acc.get(stepPart.step_id) ?? [];
      list.push(stepPart);
      acc.set(stepPart.step_id, list);
      return acc;
    }, new Map());
  }, [runStepParts]);

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
            <i className={"fa " + (toggledLabels.get(labelId) ? "fa-caret-down" : "fa-caret-right")} /> {label.label}
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
              {(!step.has_label || toggledLabels.get(step.label?.id ?? -1)) && (
                <>
                  {step.has_step_group && firstInGroupSteps.includes(step) && renderGroupHeader(step)}
                  <tr>
                    <td>
                      <Link to={`/${environment}/operator/run/step/${step.id}`}>
                        {" "}
                        <span
                          dangerouslySetInnerHTML={{
                            __html: step.name,
                          }}
                        />
                      </Link>
                    </td>
                    <td>
                      <RunLayoutPartList
                        step={step}
                        parts={runParts}
                        stepParts={runStepPartsByStepId.get(step.id) ?? []}
                        run={run}
                      />
                    </td>
                  </tr>
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
