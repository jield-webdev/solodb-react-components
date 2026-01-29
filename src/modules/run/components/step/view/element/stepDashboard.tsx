import React, { useContext, useState } from "react";
import { Alert, Card, Col, Container, Row } from "react-bootstrap";
import StepLabel from "@jield/solodb-react-components/modules/run/components/step/view/element/stepLabel";
import Process from "@jield/solodb-react-components/modules/run/components/step/view/element/process";
import RunPartsResearchRun from "@jield/solodb-react-components/modules/run/components/step/view/element/parts/runPartsResearchRun";
import RunStepChecklist from "@jield/solodb-react-components/modules/run/components/step/view/element/runStepChecklist";
import StepRemark from "@jield/solodb-react-components/modules/run/components/step/view/element/stepRemark";
import BatchCardElement from "@jield/solodb-react-components/modules/run/components/step/view/element/batchCardElement";
import HoldCodeBadge from "@jield/solodb-react-components/modules/run/components/step/view/element/holdCodeBadge";
import PriorityBadge from "@jield/solodb-react-components/modules/run/components/step/view/element/priorityBadge";
import RunStepSimpleList from "@jield/solodb-react-components/modules/run/components/step/view/element/runStepSimpleList";
import RunChangelogButton from "@jield/solodb-react-components/modules/run/components/step/view/element/run-changelog/runChangelogButton";
import StepOverviewButton from "@jield/solodb-react-components/modules/run/components/step/view/element/step-overview/stepOverviewButton";
import LogAssistElement from "@jield/solodb-react-components/modules/run/components/step/view/element/logAssistElement";
import { useQueries } from "@tanstack/react-query";
import { formatDateTime } from "@jield/solodb-react-components/utils/datetime";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";
import MonitorCard from "@jield/solodb-react-components/modules/monitor/components/monitor/monitorCard";
import Rework from "@jield/solodb-react-components/modules/run/components/step/view/element/rework";
import { Link, useParams } from "react-router-dom";
import RunPartsProductionRun from "@jield/solodb-react-components/modules/run/components/step/view/element/parts/runPartsProductionRun";
import ModuleStatusElement from "@jield/solodb-react-components/modules/equipment/components/partial/moduleStatusElement";
import ReactMarkdown from "react-markdown";
import { RunStepParametersTable } from "@jield/solodb-react-components/modules/run/components/shared/parameters/runStepParametersTable";
import UploadFilesToStep from "@jield/solodb-react-components/modules/run/components/shared/files/uploadFilesToStep";
import RequirementValuesWithPartTable from "../../../shared/requirement/requirementValuesWithPartTable";
import RequirementValuesByStep from "../../../shared/requirement/requirementValuesByStep";
import {
  listMonitors,
  getEquipmentModule,
  listRequirements,
  RunTypeEnum,
  listEcn,
} from "@jield/solodb-typescript-core";

const StepDashboard = () => {
  const { environment } = useParams();

  //Get the runStep from the runStepContext
  const { runStep, run } = useContext(RunStepContext);

  const queries = useQueries({
    queries: [
      {
        queryKey: ["monitors", runStep.process_module.module.equipment],
        queryFn: () =>
          listMonitors({
            equipment: runStep.process_module.module.equipment,
          }),
      },
      {
        queryKey: ["ecn", runStep.process_module.module],
        queryFn: () => listEcn({ module: runStep.process_module.module }),
      },
      {
        queryKey: ["equipmentModule", runStep.process_module.module],
        queryFn: () =>
          getEquipmentModule({
            id: runStep.process_module.module.id,
          }),
      },
      {
        queryKey: ["requirement", runStep.id],
        queryFn: () => listRequirements({ run: run, step: runStep }),
      },
    ],
  });

  const [monitorQuery, ecnQuery, moduleQuery, requirementQuery] = queries;

  const [showOnlyEmphasizedParameters, setShowOnlyEmphasizedParameters] = useState(true);

  //show a loading state while the queries are loading
  const isLoading = queries.some((query) => query.isLoading);

  // log any query errors to the console
  const hasError = queries.some((q) => q.isError);
  if (hasError) {
    queries
      .filter((q) => q.isError)
      .forEach((q, idx) => {
        console.error("StepDashboard query error", { index: idx, error: q.error, runStep: runStep, run });
      });
    return <>Error fetching data</>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const module = moduleQuery.data;

  return (
    <Container fluid>
      <Row>
        <Col className={"col-9"}>
          {run.run_type === RunTypeEnum.RESEARCH && <small>Research run</small>}
          {run.run_type === RunTypeEnum.PRODUCTION && <small>Production run</small>}
          <div className={"d-flex justify-content-between align-items-center mb-3"}>
            <h1 className={"display-4"}>
              {run.name} ({run.project.name})
            </h1>
            <div className={"d-flex flex-column flex-lg-row gap-2 flex-wrap justify-content-end"}>
              {runStep.has_rework && (
                <span style={{ fontSize: "1.5rem" }} className={"mx-1 badge bg-primary"}>
                  Rework
                </span>
              )}
              <PriorityBadge />
              <HoldCodeBadge />
              {runStep.is_skipped && (
                <span style={{ fontSize: "1.5rem" }} className={"badge bg-info"}>
                  SKIPPED
                </span>
              )}
            </div>
          </div>
          <BatchCardElement run={run} />
          {runStep.label && <StepLabel label={runStep.label} />}
          <Process runStep={runStep} />
          {runStep.is_finished && (
            <Alert variant={"success"}>
              This step has been finished by {runStep.finish_user?.first_name} {runStep.finish_user?.last_name}
            </Alert>
          )}
          {runStep.has_recipe && (
            <Card className={"rounded my-4"}>
              <Card.Body>
                <Card.Title className="text-muted">Recipe</Card.Title>
                <Card.Text className={"display-5"}>
                  {runStep.recipe_version!.recipe.name} (Version {runStep.recipe_version!.version})
                </Card.Text>
              </Card.Body>
            </Card>
          )}
          {requirementQuery.data?.items.length == 1 && (
            <>
              <h4>Measurements by part</h4>
              <RequirementValuesWithPartTable
                requirement={requirementQuery.data.items[0]}
                step={runStep}
                editOnly={false}
              />
              <h4>Measurements for whole step</h4>
              <RequirementValuesByStep requirement={requirementQuery.data.items[0]} editOnly={false} />
            </>
          )}
          {requirementQuery.data?.items.length != 1 && run.run_type === RunTypeEnum.RESEARCH && (
            <>
              <h3>Available parts</h3>
              <RunPartsResearchRun run={run} runStep={runStep} />
            </>
          )}
          {requirementQuery.data?.items.length != 1 && run.run_type === RunTypeEnum.PRODUCTION && (
            <>
              <h3>Available parts</h3>
              <RunPartsProductionRun run={run} runStep={runStep} />
            </>
          )}
          <Row className={"py-4"}>
            <Col>
              <h3>Checklist</h3>
              <RunStepChecklist />
            </Col>
            <Col>
              <h2>Parameters</h2>
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
              <RunStepParametersTable
                runStep={runStep}
                editableParameters={false}
                showOnlyEmphasizedParameters={showOnlyEmphasizedParameters}
              />

              {runStep.has_instructions && runStep.instructions && (
                <>
                  <h3>Instructions</h3>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: runStep.instructions,
                    }}
                  />
                </>
              )}

              <h3>Remark</h3>
              <StepRemark />

              <h3 className={"pt-3"}>Rework</h3>
              <Rework />
            </Col>
          </Row>
          <Row>
            <Col>
              <h2>Step files</h2>
              <UploadFilesToStep runStep={runStep} />
            </Col>
            <Col>
              <div className={"d-flex justify-content-between mb-3"}>
                <h2>Run steps</h2>
                <div className={"d-flex gap-2 flex-wrap justify-content-end"}>
                  <div>
                    <StepOverviewButton size={undefined} />
                  </div>
                  <div>
                    <RunChangelogButton size={undefined} />
                  </div>
                  <div>
                    <LogAssistElement size={undefined} moduleId={runStep.process_module.module.id} />
                  </div>
                </div>
              </div>
              <RunStepSimpleList pageSize={run.run_type === RunTypeEnum.RESEARCH ? 5 : 1000} hideLabel={true} />
            </Col>
          </Row>
        </Col>

        <Col className={"col-3"}>
          <div className={"d-flex flex-column"}>
            <h2>
              <Link to={`/${environment}/operator/equipment/${runStep.process_module.module.equipment.id}`}>
                {runStep.process_module.module.equipment.name} ({runStep.process_module.module.name})
              </Link>
            </h2>

            {module && (
              <div>
                <h2>
                  <ModuleStatusElement module={module} />
                </h2>
              </div>
            )}

            {monitorQuery.data?.items &&
              monitorQuery.data.items.map((monitor, i) => {
                return <MonitorCard monitor={monitor} key={i} />;
              })}

            {ecnQuery.data?.items.map(function (ecn, i: React.Key) {
              return (
                <Card className={"my-2"} key={i}>
                  <Card.Header>ECN: {ecn.ecn}</Card.Header>
                  <Card.Body>
                    <Card.Text>
                      <ReactMarkdown>{ecn.description}</ReactMarkdown>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    {ecn.date_created && (
                      <>
                        Created by {formatDateTime(ecn.date_created, "DD-MM-YY H:m")} by {ecn.owner.full_name}
                      </>
                    )}
                    {ecn.last_update && (
                      <>
                        {" "}
                        &middot; Updated by {formatDateTime(ecn.last_update, "DD-MM-YY H:m")} by {ecn.owner.full_name}
                      </>
                    )}
                  </Card.Footer>
                </Card>
              );
            })}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StepDashboard;
