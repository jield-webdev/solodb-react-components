import { Button } from "react-bootstrap";
import { FillValueModal } from "./fillValueModal";
import { useEffect, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Requirement, MeasurementResult, MeasurementResultValue, listMeasurementResults } from "solodb-typescript-core";

export default function RequirementValuesByStep({
  requirement,
  measurementResults,
  refetchFn,
  editOnly = false,
}: {
  requirement: Requirement;
  measurementResults?: MeasurementResult[];
  refetchFn?: (keys: any[]) => void;
  editOnly?: boolean;
}) {
  const [filteredMeasurements, setFilteredMeasurementResultsData] = useState<MeasurementResult[]>(
    measurementResults ?? []
  );

  const queryClient = useQueryClient();

  // Filter out measurements that have values linked to a step
  const queries = useQueries({
    queries: [
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
  };

  const [measurementResultsQuery] = queries;

  useEffect(() => {
    if (measurementResults && measurementResults.length > 0) {
      setFilteredMeasurementResultsData(
        measurementResults.filter((result) => result.values.some((value) => !value.step_part_id))
      );
    } else if (measurementResultsQuery?.data) {
      setFilteredMeasurementResultsData(
        measurementResultsQuery.data.items.filter((result) => result.values.some((value) => !value.step_part_id))
      );
    }
  }, [measurementResults, measurementResultsQuery?.data]);

  const [openModalMeasurementId, setOpenModalMeasurementId] = useState<number | null>(null);
  const [openModalNewResult, setOpenModalNewResult] = useState<boolean>(false);

  //show a loading state while the queries are loading
  const isLoading = queries.some((query) => query.isLoading);

  // log any query errors to the console
  const hasError = queries.some((q) => q.isError);
  if (hasError) {
    queries
      .filter((q) => q.isError)
      .forEach((q, idx) => {
        console.error("StepDashboard query error", { index: idx, error: q.error });
      });
    return <>Error fetching data</>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getRowStatusClass = (value: MeasurementResultValue): string => {
    if (!(value && !isNaN(parseFloat(value.string_value)))) return "";

    const val = parseFloat(value.string_value);
    const target = requirement.targets.find((t) => t.logging_parameter.id === value.logging_parameter.id);
    if (!target) return "";

    const failed = target.inclusive
      ? !(target.min_value <= val && target.max_value >= val)
      : !(target.min_value < val && target.max_value > val);

    return failed ? "table-danger" : "";
  };

  return (
    <div className="d-flex flex-column gap-4">
      {filteredMeasurements.map((result) => (
        <div key={result.id} className="border rounded p-3 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">
              Result <small className="text-muted">#{result.id}</small>
            </h6>
            {!editOnly && (
              <Button size="sm" variant="outline-primary" onClick={() => setOpenModalMeasurementId(result.id)}>
                <i className="fa fa-edit"></i> Update value
              </Button>
            )}
          </div>

          <table className="table table-striped table-sm mb-0">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {result.values.map((value) => (
                <tr key={`value:${value.id}`} className={value ? getRowStatusClass(value) : ""}>
                  <td>{value.logging_parameter.name}</td>
                  <td>{value.string_value}</td>
                  <td>{value.logging_parameter.unit?.abbr ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal for this result */}
          <FillValueModal
            requirement={requirement}
            result={result}
            show={openModalMeasurementId === result.id}
            setShow={(show) => {
              if (!show) setOpenModalMeasurementId(null);
            }}
            refetchFn={refetchFn ?? reloadMeasurementResult}
          />
        </div>
      ))}

      <div className="mt-3">
        <Button size="sm" onClick={() => setOpenModalNewResult(!openModalNewResult)}>
          <i className="fa fa-plus"></i> Add results
        </Button>
      </div>

      {/* Modal for new result */}
      <FillValueModal
        requirement={requirement}
        show={openModalNewResult}
        setShow={(show) => {
          if (!show) setOpenModalNewResult(false);
        }}
        refetchFn={refetchFn ?? reloadMeasurementResult}
      />
    </div>
  );
}
