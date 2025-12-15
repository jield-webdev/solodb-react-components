import React, { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { Alert, Badge, Col, Row, Table } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { MonitorRequirement } from "@/modules/monitor/interfaces/monitorRequirement";
import ListMonitorRequirementResults from "@/modules/monitor/api/measurement/listMonitorRequirementResults";
import axios from "axios";
import { formatDateTime } from "@/utils/datetime";
import { File } from "@/modules/core/interfaces/file";
import ListMonitorStepFiles from "@/modules/monitor/api/step/listMonitorStepFiles";
import { GetServerUri } from "@/modules/core/functions/getServerUri";
import ListMonitorRequirementTargets from "@/modules/monitor/api/requirement/listMonitorRequirementTargets";
import RequirementChart from "@/modules/monitor/components/monitor/requirement/requirementChart";
import PaginationLinks from "@/modules/partial/paginationLinks";
import AddResultModal from "@/modules/monitor/components/monitor/requirement/addResultModal";
import AddStepParameterValueModal from "@/modules/monitor/components/monitor/requirement/addStepParameterValueModal";
import ListMonitorRequirementResultMonitorStepParameterValues from "@/modules/monitor/api/measurement/result/listMonitorRequirementResultMonitorStepParameterValues";
import { MonitorStepParameter } from "@/modules/monitor/interfaces/monitor/step/parameter";
import EditStepParameterValueModal from "@/modules/monitor/components/monitor/requirement/editStepParameterValueModal";

export default function RequirementResults({ requirement }: { requirement: MonitorRequirement }) {
  const AMOUNT_OF_FILES = 11;

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [reportedStepParametersWithValues, setReportedStepParametersWithValues] = useState<MonitorStepParameter[]>([]);

  const [requirementFilesQuery, targetQuery, resultsQuery, monitorStepParameterValuesQuery] = useQueries({
    queries: [
      {
        queryKey: ["requirement", "files", requirement.step, AMOUNT_OF_FILES],
        queryFn: () =>
          ListMonitorStepFiles({
            step: requirement.step,
            pageSize: AMOUNT_OF_FILES,
            order: "date-created",
            direction: "desc",
          }),
      },
      {
        queryKey: ["requirement", "target", requirement],
        queryFn: () => ListMonitorRequirementTargets({ requirement: requirement }),
      },
      {
        queryKey: ["requirement", "results", requirement, page, pageSize],
        queryFn: () =>
          ListMonitorRequirementResults({
            requirement: requirement,
            pageSize: pageSize,
            order: "date-created",
            direction: "desc",
            page: page,
          }),
        placeholderData: keepPreviousData,
      },
      {
        queryKey: ["requirement", "monitor_step_parameters", requirement, page, pageSize],
        queryFn: () =>
          ListMonitorRequirementResultMonitorStepParameterValues({
            requirement: requirement,
            pageSize: pageSize,
            order: "date-created",
            direction: "desc",
            page: page,
          }),
        placeholderData: keepPreviousData,
      },
    ],
  });

  //Fill the status with the images and files
  useEffect(() => {
    setUploadedFiles([]);
    !requirementFilesQuery.isLoading &&
      requirementFilesQuery.data!.items.forEach((file: File) => {
        // if (file.has_monitor_step_loggings) {
        setUploadedFiles((uploadedFiles) => [...uploadedFiles, file]);
        // }
      });
  }, [requirementFilesQuery.isLoading]);

  //We need to grab all moduleStepParameters with values to create the columns
  useEffect(() => {
    if (!monitorStepParameterValuesQuery.data) return;

    const uniqueValues = Array.from(
      new Map(
        monitorStepParameterValuesQuery.data.items.map((value) => [value.step_parameter.id, value.step_parameter])
      ).values()
    );

    setReportedStepParametersWithValues(uniqueValues);
  }, [monitorStepParameterValuesQuery.isLoading, monitorStepParameterValuesQuery.data]);

  const onDrop = useCallback(
    (acceptedFiles: any) => {
      acceptedFiles.forEach((file: any) => {
        const reader = new FileReader();

        reader.onload = async () => {
          // Do whatever you want with the file contents
          const binaryStr = reader.result;

          //Upload the file to the server
          try {
            await axios.create().post("update/monitor/requirement/upload-file/" + requirement.id, {
              content: binaryStr,
              filename: file.name,
              type: file.type,
            });
          } catch (error: any) {
            //We know that the error is an AxiosError
            setUploadStatus("Upload failed due to: " + error.response.data.detail);
          }

          await requirementFilesQuery.refetch();
          await resultsQuery.refetch();
        };

        reader.readAsDataURL(file);
      });
    },
    [requirement.id, requirementFilesQuery, resultsQuery]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({ onDrop });

  const style = useMemo(
    () => ({
      ...(isDragActive ? { borderColor: "#83afee" } : {}),
      ...(isDragAccept ? { borderColor: "#00e676" } : {}),
      ...(isDragReject ? { borderColor: "#ff1744" } : {}),
    }),
    [isDragAccept, isDragReject, isDragActive]
  );

  if (targetQuery.isLoading || targetQuery.isFetching) return <Alert variant={"info"}>Loading targets...</Alert>;
  if (resultsQuery.isLoading || resultsQuery.isFetching) return <Alert variant={"info"}>Loading results...</Alert>;

  return (
    <>
      <h1 className={"display-5"}>Requirement: {requirement.title}</h1>
      <p className={"lead"}>{requirement.definition}</p>

      <Row className={"my-3"}>
        <Col>
          <h2>Charts</h2>
          <div className={"d-flex"}>
            {targetQuery.data?.items.map((target, index) => {
              return <RequirementChart target={target} results={resultsQuery.data!.items} key={index} />;
            })}
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          {requirement.method && requirement.method !== "-" && (
            <>
              <h2>Method</h2>
              <p>{requirement.method}</p>
            </>
          )}

          {targetQuery.data?.items.length === 0 && <Alert variant={"danger"}>No targets found</Alert>}

          <div className={"d-flex justify-content-between"}>
            <h2>Results</h2>
            <div>
              <AddResultModal
                requirement={requirement}
                targets={targetQuery.data!.items}
                refetchResults={resultsQuery.refetch}
              />
            </div>
          </div>
          <Table size="sm" striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                {targetQuery.data?.items.map((target, index) => {
                  return <th key={index}>{target.logging_parameter.name}</th>;
                })}
                {reportedStepParametersWithValues.map((stepParameter, index) => {
                  return <th key={index}>{stepParameter.parameter.name}</th>;
                })}
                <th>+</th>
              </tr>
              <tr>
                <th colSpan={2}></th>
                {targetQuery.data?.items.map((target, index) => {
                  return (
                    <td key={index}>
                      {target.min_value}

                      {target.is_value_inclusive && <span className={"text-muted px-2"}>&le;</span>}
                      {!target.is_value_inclusive && <span className={"text-muted px-2"}>&lt;</span>}

                      {target.target ?? "X"}

                      {target.is_value_inclusive && <span className={"text-muted px-2"}>&ge;</span>}
                      {!target.is_value_inclusive && <span className={"text-muted px-2"}>&gt;</span>}

                      {target.max_value}
                    </td>
                  );
                })}
                {reportedStepParametersWithValues.map((stepParameter, index) => {
                  return <th className={"table-secondary"} key={index} />;
                })}
                <th />
              </tr>
            </thead>
            <tbody>
              {resultsQuery.data?.items.map((result, index) => {
                return (
                  <tr key={index}>
                    <th key={index}>
                      <small className={"text-muted"}>{result.id}</small>
                    </th>
                    <td>
                      {formatDateTime(result.date_created, "DD-MM-YY HH:mm")}
                    </td>

                    {targetQuery.data?.items.map((target, index) => {
                      return (
                        <td key={index}>
                          {result.values
                            .filter((value) => value.logging_parameter.id === target.logging_parameter.id)
                            .map((value, index) => {
                              return (
                                <span key={index} className={value.value_is_valid ? "text-success" : "text-danger"}>
                                  {value.float_value}
                                </span>
                              );
                            })}
                        </td>
                      );
                    })}

                    {reportedStepParametersWithValues.map((stepParameter, index) => {
                      return (
                        <td className={"table-secondary"} key={index}>
                          {monitorStepParameterValuesQuery.data?.items
                            .filter(
                              (monitorStepParameterValue) =>
                                monitorStepParameterValue.step_parameter.id === stepParameter.id &&
                                monitorStepParameterValue.result.id === result.id
                            )
                            .map((monitorResultStepParameterValue, index) => {
                              return (
                                <EditStepParameterValueModal
                                  monitorResultStepParameterValue={monitorResultStepParameterValue}
                                  key={index}
                                  refetchMonitorStepParameterValues={monitorStepParameterValuesQuery.refetch}
                                />
                              );
                            })}
                        </td>
                      );
                    })}

                    <td>
                      <AddStepParameterValueModal
                        result={result}
                        requirement={requirement}
                        refetchMonitorStepParameterValues={monitorStepParameterValuesQuery.refetch}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <PaginationLinks
            data={resultsQuery.data}
            setPage={setPage}
            setPageSize={setPageSize}
            pageSize={pageSize}
            isPlaceholderData={resultsQuery.isPlaceholderData}
          />
        </Col>

        <Col md={4}>
          <h2>Upload new results</h2>
          <p>Drop your results file here</p>
          <div {...getRootProps({ style, className: "dropzone" })}>
            <input {...getInputProps()} />
            {isDragActive ? <p>Drop file(s) here ...</p> : <p>Drag and drop file(s) here, or click to select files</p>}
            <p>{uploadStatus}</p>
          </div>

          {uploadedFiles.length > 0 && (
            <>
              <h2 className={"mt-2"}>Uploaded files</h2>
              <p>Last {AMOUNT_OF_FILES} uploaded files</p>
              <ul className={"list-group"}>
                {uploadedFiles.map((file: File, i: number) => {
                  return (
                    <li className={"list-group-item"} key={i}>
                      <div className={"d-flex justify-content-between"}>
                        <span>
                          {i + 1} <a href={GetServerUri() + file.url}>{file.name}</a>
                          {file.has_monitor_step_loggings && <Badge className={"ms-1 bg-primary"}>Logging</Badge>}
                        </span>
                        <span>
                          {Math.round(file.size / 1024)}
                          kiB
                        </span>
                      </div>
                      <small className={"text-muted"}>
                        {formatDateTime(file.date_created, "DD-MM-YY HH:mm")}
                      </small>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Col>
      </Row>
    </>
  );
}
