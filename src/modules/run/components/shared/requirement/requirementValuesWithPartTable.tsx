import { Alert, Button, Spinner, Table } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { FillValueModal } from "@/modules/run/components/shared/requirement/fillValueModal";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";
import { listMeasurementResults, listRunParts, listRunStepParts, MeasurementResult, MeasurementResultValue, Requirement, RunPart, RunStep, RunStepPart } from "solodb-typescript-core";

export default function RequirementValuesWithPartTable({
  requirement,
  step,
  stepParts,
  parts,
  measurementResults,
  refetchFn,
  editOnly = false,
}: {
  requirement: Requirement;
  step: RunStep;
  stepParts?: RunStepPart[];
  parts?: RunPart[];
  measurementResults?: MeasurementResult[];
  refetchFn?: (keys: any[]) => void;
  editOnly?: boolean;
}) {
  const { run } = useContext(RunStepContext);

  // Local state so updates cause re-renders
  const [runPartsData, setRunPartsData] = useState<RunPart[]>(parts ?? []);
  const [runStepPartsData, setRunStepPartsData] = useState<RunStepPart[]>(stepParts ?? []);
  const [measurementResultsData, setMeasurementResultsData] = useState<MeasurementResult[]>(measurementResults ?? []);

  const queryClient = useQueryClient();

  const queries = useQueries({
    queries: [
      {
        queryKey: ["runParts", `${run?.id ?? "unknown"}`],
        queryFn: async () => await listRunParts({ run }),
        enabled: !parts || parts.length === 0,
        retry: 1,
      },
      {
        queryKey: ["runStepParts", `${step?.run_id ?? "unknown"}`, `${step?.id ?? "unknown"}`],
        queryFn: async () => await listRunStepParts({ step: requirement.requirement_for_step ?? requirement.step }),
        enabled: !stepParts || stepParts.length === 0,
        retry: 1,
      },
      {
        queryKey: ["requirement", "measurementResults", requirement.measurement.id],
        queryFn: async () => await listMeasurementResults({ measurement: requirement.measurement }),
        enabled: !measurementResults || measurementResults.length === 0,
        retry: 1,
      },
    ],
  });

  const reloadMeasurementResult = () => {
        queryClient.refetchQueries({ queryKey: ["requirement", "measurementResults", requirement.measurement.id] });
  }

  const [runPartsQuery, runStepPartsQuery, measurementResultsQuery] = queries;

  useEffect(() => {
    if (parts && parts.length > 0) {
      setRunPartsData(parts);
    } else if (runPartsQuery?.data) {
      setRunPartsData(runPartsQuery.data.items);
    }
  }, [parts, runPartsQuery?.data]);

  useEffect(() => {
    if (stepParts && stepParts.length > 0) {
      setRunStepPartsData(stepParts);
    } else if (runStepPartsQuery?.data) {
      setRunStepPartsData(runStepPartsQuery.data.items);
    }
  }, [stepParts, runStepPartsQuery?.data]);

  useEffect(() => {
    if (measurementResults && measurementResults.length > 0) {
      setMeasurementResultsData(measurementResults);
    } else if (measurementResultsQuery?.data) {
      setMeasurementResultsData(measurementResultsQuery.data.items);
    }
  }, [measurementResults, measurementResultsQuery?.data]);

  // Track which part's modal is open (store as string to avoid number/string mismatch)
  const [openModalPartId, setOpenModalPartId] = useState<string | null>(null);

  // Effective arrays to use when building rows (prefer props over fetched)
  const finalParts = parts && parts.length > 0 ? parts : runPartsData;
  const finalStepParts = stepParts && stepParts.length > 0 ? stepParts : runStepPartsData;

  const filteredStepParts = (finalStepParts ?? []).filter(
    (stepPart: RunStepPart) =>
      (finalParts ?? []).find(
        (part: RunPart) => part.id === stepPart.part.id && part.part_level === step.part_level
      ) !== undefined
  );

  // Loading & error states
  const needRunParts = !parts || parts.length === 0;
  const needRunStepParts = !stepParts || stepParts.length === 0;
  const needMeasurementResults = !measurementResults || measurementResults.length === 0;

  const anyLoading =
    (needRunParts && runPartsQuery?.isLoading) ||
    (needRunStepParts && runStepPartsQuery?.isLoading) ||
    (needMeasurementResults && measurementResultsQuery?.isLoading);

  const anyError =
    (needRunParts && runPartsQuery?.isError) ||
    (needRunStepParts && runStepPartsQuery?.isError) ||
    (needMeasurementResults && measurementResultsQuery?.isError);

  if (anyLoading && filteredStepParts.length === 0) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" /> <span>Loading data…</span>
      </div>
    );
  }

  if (anyError && filteredStepParts.length === 0) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>Failed to load required data. Please try again.</div>
        <div>
          {needRunParts && runPartsQuery?.isError && (
            <Button size="sm" variant="outline-light" onClick={() => runPartsQuery.refetch()}>
              Retry parts
            </Button>
          )}{" "}
          {needRunStepParts && runStepPartsQuery?.isError && (
            <Button size="sm" variant="outline-light" onClick={() => runStepPartsQuery.refetch()}>
              Retry step parts
            </Button>
          )}{" "}
          {needMeasurementResults && measurementResultsQuery?.isError && (
            <Button size="sm" variant="outline-light" onClick={() => measurementResultsQuery.refetch()}>
              Retry results
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  const getRowStatusClass = (value: MeasurementResultValue): string => {
    if (!(value && !isNaN(parseFloat(value.string_value)))) return "";

    const val = parseFloat(value.string_value);
    const target = requirement.targets.find((t) => t.logging_parameter.id === value.logging_parameter.id);
    if (!target) return "";

    const failed = target.inclusive
      ? !(target.min_value <= val && target.max_value >= val)
      : !(target.min_value < val && target.max_value > val);

    return failed ? "table-danger" : "table-success";
  };

  return (
    <>
      {filteredStepParts.length > 0 ? (
        <>
          <Table size="sm" striped hover>
            <thead>
              <tr>
                <th style={{ width: "26%" }}>Part</th>
                <th>Parameter</th>
                <th>Value</th>
                <th>Unit</th>
                {!editOnly && <th style={{ width: "1%" }}></th>}
              </tr>
            </thead>
            <tbody>
              {filteredStepParts.map((stepPart: RunStepPart) => {
                const existingResult: MeasurementResult | undefined = measurementResultsData.find((r) =>
                  r.values.some((v) => v.step_part_id === stepPart.id)
                );

                const valuesForPart = (existingResult?.values ?? []).filter(
                  (v) => v.step_part_id === stepPart.id
                );

                const rowSpan = requirement.targets.length;

                return requirement.targets.map((target, idx) => {
                  const value =
                    valuesForPart.find(
                      (v) => v.logging_parameter.id === target.logging_parameter.id
                    ) ?? null;

                  const rowClass = value ? getRowStatusClass(value) : "";

                  return (
                    <tr key={`${stepPart.id}:${target.logging_parameter.id}`} className={rowClass}>
                      {idx === 0 && (
                        <td rowSpan={rowSpan}>
                          {stepPart.part.short_label}{" "}
                          <small className="text-muted">({stepPart.id})</small>
                        </td>
                      )}

                      <td>{target.logging_parameter.name}</td>
                      <td>{value ? value.string_value : <span className="text-muted">not set</span>}</td>
                      <td>{target.logging_parameter.unit?.abbr ?? ""}</td>

                      {!editOnly && idx === 0 && (
                        <td rowSpan={rowSpan} className="align-middle text-nowrap">
                          <Button
                            size="sm"
                            variant={existingResult ? "outline-primary" : "outline-success"}
                            onClick={() => setOpenModalPartId(String(stepPart.id))}
                          >
                            <i className="fa fa-edit" /> {existingResult ? "Edit values" : "Add values"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                });
              })}
            </tbody>
          </Table>

          {!editOnly &&
            filteredStepParts.map((stepPart) => {
              const existingResult: MeasurementResult | undefined = measurementResultsData.find((r) =>
                r.values.some((v) => v.step_part_id === stepPart.id)
              );

              return (
                <FillValueModal
                  key={`modal:${stepPart.id}`}
                  requirement={requirement}
                  {...(existingResult
                    ? { result: existingResult } 
                    : { part: stepPart.part, stepPart })} 
                  show={openModalPartId === String(stepPart.id)}
                  setShow={(show) => {
                    if (!show) setOpenModalPartId(null);
                  }}
                  refetchFn={refetchFn ?? reloadMeasurementResult}
                />
              );
            })}
        </>
      ) : (
        <Alert variant="secondary" className="mb-0">
          No selected parts
        </Alert>
      )}
    </>
  );
}

