import React, { JSX, useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import ListRuns from "@/modules/run/api/listRuns";
import { Alert, Button, Col, Container, Row, Table } from "react-bootstrap";
import ListEcn from "@/modules/equipment/api/module/listEcn";
import ListMonitors from "@/modules/monitor/api/listMonitors";
import MonitorCard from "@/modules/monitor/components/monitor/monitorCard";
import LogAssistElement from "@/modules/run/components/step/view/element/logAssistElement";
import { EquipmentContext } from "@/modules/equipment/contexts/equipmentContext";
import { Run } from "@/modules/run/interfaces/run";
import ListEcnAttachments from "@/modules/equipment/api/module/ecn/listEcnAttachments";
import ListModules from "@/modules/equipment/api/module/listModules";
import ListIssueAttachments from "@/modules/equipment/api/module/issue/listIssueAttachments";
import ListIssues from "@/modules/equipment/api/module/listIssues";
import IssueCard from "@/modules/equipment/components/dashboard/issueCard";
import EcnCard from "@/modules/equipment/components/dashboard/ecnCard";
import EcnModalForm from "@/modules/equipment/components/partial/ecnModalForm";
import IssueModalForm from "@/modules/equipment/components/partial/issueModalForm";
import ModuleStatusElement from "@/modules/equipment/components/partial/moduleStatusElement";
import ListEquipmentReport from "@/modules/service/components/equipmentReports/ListEquipmentReport";

export default function EquipmentDashboard() {
  const { environment } = useParams();
  const { equipment } = useContext(EquipmentContext);

  const queryClient = useQueryClient();

  const [issueModalElement, setIssueModalElement] = useState<JSX.Element | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const [ecnModalElement, setEcnModalElement] = useState<JSX.Element | null>(null);
  const [showEcnModal, setShowEcnModal] = useState<boolean>(false);

  const [runsQuery, monitorQuery, ecnQuery, issuesQuery, modulesQuery, ecnAttachmentsQuery, issueAttachmentsQuery] =
    useQueries({
      queries: [
        {
          queryKey: ["runs", equipment.name, environment],
          queryFn: () =>
            ListRuns({
              firstUnfinishedStepEquipment: equipment,
              environment: environment,
            }),
        },
        {
          queryKey: ["monitors", equipment.name],
          queryFn: () => ListMonitors({ equipment: equipment }),
        },
        {
          queryKey: ["ecn", equipment.name],
          queryFn: () => ListEcn({ equipment: equipment }),
        },

        {
          queryKey: ["issue", equipment.name],
          queryFn: () => ListIssues({ equipment: equipment }),
        },
        {
          queryKey: ["module", equipment.name],
          queryFn: () => ListModules({ equipment: equipment }),
        },
        {
          queryKey: ["ecn", "attachment", equipment.name],
          queryFn: () => ListEcnAttachments({ equipment: equipment }),
        },
        {
          queryKey: ["issue", "attachment", equipment.name],
          queryFn: () => ListIssueAttachments({ equipment: equipment }),
        },
      ],
    });

  const reloadQueriesByKey = (key: string[]) => {
    queryClient.invalidateQueries({ queryKey: key });
  };

  const findEcnNotes = (moduleId: number | undefined) => {
    if (!moduleId) {
      return [];
    }

    return ecnQuery.data?.items.filter((ecnNote) => ecnNote.module_id === moduleId);
  };

  const findIssues = (moduleId: number | undefined) => {
    if (!moduleId) {
      return [];
    }

    return issuesQuery.data?.items.filter((ecnNote) => ecnNote.module_id === moduleId);
  };

  const handleEcnButton = () => {
    setEcnModalElement(
      <EcnModalForm
        equipment={equipment}
        showModal={true}
        onClose={() => {
          setShowEcnModal(false);
          setTimeout(() => {
            reloadQueriesByKey(["ecn", equipment.name]);
            reloadQueriesByKey(["ecn", "attachment", equipment.name]);
          }, 100);
        }}
      />
    );

    setShowEcnModal(true);
  };

  const handleIssueButton = () => {
    setIssueModalElement(
      <IssueModalForm
        equipment={equipment}
        showModal={true}
        onClose={() => {
          setShowIssueModal(false);
          setTimeout(() => {
            reloadQueriesByKey(["issue", equipment.name]);
            reloadQueriesByKey(["issue", "attachment", equipment.name]);
          }, 100);
        }}
      />
    );

    setShowIssueModal(true);
  };

  return (
    <Container fluid>
      <div className={"d-flex justify-content-left"}>
        {monitorQuery.data?.items &&
          monitorQuery.data.items.map((monitor, i) => {
            return <MonitorCard monitor={monitor} key={i} />;
          })}
      </div>

      <Row>
        <Col md={8}>
          <h2>Runs</h2>
          {runsQuery.isLoading && <div>Loading...</div>} {runsQuery.isError && <div>Error...</div>}
          {runsQuery.isFetched && runsQuery.data && runsQuery.data?.items.length === 0 && (
            <Alert variant={"info"}>No runs found</Alert>
          )}
          {runsQuery.isFetched && runsQuery.data && runsQuery.data?.items.length > 0 && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Priority</th>
                  <th>Hold Code</th>
                  <th>Batch Card</th>
                  <th>Project</th>
                </tr>
              </thead>
              <tbody>
                {runsQuery.data?.items.map((run: Run, i: React.Key) => {
                  return (
                    <tr key={i}>
                      <td>
                        {run.first_unfinished_step && (
                          <Link to={`/${environment}/operator/run/step/${run.first_unfinished_step.id}`}>
                            {run.name}
                          </Link>
                        )}
                        {run.first_unfinished_step === undefined && run.last_finished_step && (
                          <Link to={`/${environment}/operator/run/step/${run.last_finished_step.id}`}>{run.name}</Link>
                        )}
                      </td>
                      <td>
                        {run.priority && (
                          <span
                            className={"badge"}
                            style={{
                              backgroundColor: run.priority.priority.back_color,
                              color: run.priority.priority.front_color,
                            }}
                          >
                            {run.priority.priority.code}
                          </span>
                        )}
                        {!run.priority && <span className={"badge bg-info"}>NORMAL</span>}
                      </td>
                      <td>
                        {run.hold_code && (
                          <span
                            className={"badge handle"}
                            style={{
                              backgroundColor: run.hold_code.hold_code.back_color,
                              color: run.hold_code.hold_code.front_color,
                            }}
                          >
                            {run.hold_code.hold_code.code}
                          </span>
                        )}
                      </td>
                      <td>
                        {run.batch_card && run.batch_card.content && (
                          <span className={"text-danger"}>{run.batch_card.content}</span>
                        )}
                      </td>

                      <td>{run.project.name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          <ListEquipmentReport />
        </Col>
        <Col md={4}>
          <h2>Assistance</h2>
          {modulesQuery.data?.items.map((module, i) => (
            <React.Fragment key={i}>
              <div className="d-flex justify-content-between">
                <h3>{!module.type.is_main_tool ? module.name : "Main tool"}</h3>
                <div>
                  <ModuleStatusElement module={module} />
                </div>
              </div>

              <div className="pb-lg-5">
                <div className="d-flex justify-content-between">
                  <div className="d-flex gap-2">
                    <div>
                      <Button variant={"primary"} size={"sm"} onClick={handleIssueButton}>
                        New Issue
                      </Button>
                    </div>
                    <div>
                      <Button variant={"primary"} size={"sm"} onClick={handleEcnButton}>
                        New ECN
                      </Button>
                    </div>
                    <div>{module.type.is_main_tool && <LogAssistElement size="sm" moduleId={module.id} />}</div>
                  </div>
                </div>

                {findEcnNotes(module.id)?.map((ecn, j) => (
                  <EcnCard
                    key={`ecn-${i}-${j}`}
                    ecn={ecn}
                    equipment={equipment}
                    ecnAttachments={ecnAttachmentsQuery.data?.items ?? []}
                    reloadQueryFn={reloadQueriesByKey}
                  />
                ))}

                {findIssues(module.id)?.map((issue, j) => (
                  <IssueCard
                    key={`issue-${i}-${j}`}
                    issue={issue}
                    equipment={equipment}
                    issueAttachments={issueAttachmentsQuery.data?.items ?? []}
                    reloadQueryFn={reloadQueriesByKey}
                  />
                ))}
              </div>
            </React.Fragment>
          ))}
        </Col>
      </Row>

      {showEcnModal && ecnModalElement}
      {showIssueModal && issueModalElement}
    </Container>
  );
}
