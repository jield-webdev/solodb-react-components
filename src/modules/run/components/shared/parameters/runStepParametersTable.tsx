import { Alert, Table } from "react-bootstrap";
import { RunStepParameterEditButton } from "@/modules/run/components/shared/parameters/runStepParameterEditButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { RunStep, listRunStepParameters, RunStepParameter } from "solodb-typescript-core";

export const RunStepParametersTable = ({
  runStep,
  showOnlyEmphasizedParameters,
  editableParameters = true,
  refetchFn,
}: {
  runStep: RunStep;
  showOnlyEmphasizedParameters: boolean;
  editableParameters?: boolean;
  refetchFn?: () => void;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["runStepParameters", runStep.id],
    queryFn: () => listRunStepParameters({ runStep: runStep }),
  });

  const queryClient = useQueryClient();

  const refetch = () => {
    queryClient.refetchQueries({ queryKey: ["runStepParameters", runStep.id] });
    if (refetchFn) {
      refetchFn();
    }
  };

  const parameters: RunStepParameter[] = data?.items ?? [];

  const displayedParameters = showOnlyEmphasizedParameters ? parameters.filter((param) => param.emphasize) : parameters;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (parameters.length === 0) {
    return <Alert variant={"info"}>No parameters found</Alert>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Pos</th>
          <th>Parameter</th>
          {parameters[0].values.map((i, index: number) => (
            <th key={index}>Value</th>
          ))}
          <th>Unit</th>
        </tr>
      </thead>
      <tbody>
        {displayedParameters.length > 0 ? (
          displayedParameters.map((param) => (
            <tr key={param.id}>
              <td>
                <small className={"text-muted"}>{param.sequence}</small>
              </td>
              <td>{param.parameter.name}</td>
              {param.values.map((value, i: React.Key) => (
                <td key={i}>
                  {editableParameters ? (
                    <RunStepParameterEditButton parameter={param} refetchFn={refetch} value={value} />
                  ) : (
                    <span>{value.value}</span>
                  )}
                </td>
              ))}
              <td>{param.unit?.abbr ?? ""}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3 + parameters[0].values.length}>No emphasized parameters found.</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};
