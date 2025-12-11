import React, { useContext, useRef } from "react";
import { Alert, Button, ListGroup } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RunStepChecklistItem } from "@/modules/run/interfaces/step/runStepChecklistItem";
import axios from "axios";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";
import { useQuery } from "@tanstack/react-query";
import ListRunStepChecklistItems from "@/modules/run/api/step/listRunStepChecklistItems";
import ChecklistItemElement from "@/modules/run/components/step/view/element/checklist/checklistItemElement";

const RunStepChecklist = () => {
  let navigate = useNavigate();
  const { environment } = useParams();

  const { runStep, reloadRunStep, run } = useContext(RunStepContext);
  let canFinishOperation = useRef<boolean>(false);

  //Grab the checklist, via a tanstack query
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["checklist", runStep.id],
    queryFn: () => ListRunStepChecklistItems({ runStep: runStep }),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  function finishOperation(runStep: RunStep) {
    axios
      .create()
      .patch<RunStep>("update/run/step/finish/" + runStep.id, {})
      .then((response) => {
        if (response.data.next_step_id !== null) {
          navigate(`/${environment}/operator/run/step/${response.data.next_step_id}`);
        }
      });
  }

  function skipOperation(runStep: RunStep) {
    axios
      .create()
      .patch("update/run/step/skip/" + runStep.id, {})
      .then(() => {
        reloadRunStep();
        if (runStep.next_step_id !== null) {
          // navigate(`/${environment}/operator/run/step/${runStep.next_step_id}`);
        }
      });
  }

  function unSkipOperation(runStep: RunStep) {
    axios
      .create()
      .patch("update/run/step/un-skip/" + runStep.id, {})
      .then(() => {
        reloadRunStep();
      });
  }

  let hasRenderedFinishedButton = false;
  canFinishOperation.current = !runStep.is_finished;

  data!.items.forEach((runStepChecklistItem: RunStepChecklistItem) => {
    let canFinishChecklist = !runStepChecklistItem.is_executed && !hasRenderedFinishedButton;

    //Save the state in the object
    runStepChecklistItem.can_finish = canFinishChecklist;

    if (canFinishChecklist) {
      //If we have 1 checklist, we set the value of hasRenderedFinishedButton to true, so it won't ben rendered again
      hasRenderedFinishedButton = true;
      canFinishOperation.current = false;
    }
  });

  return (
    <>
      {data!.items.length === 0 && <Alert variant={"info"}>No checklist found</Alert>}

      {data!.items.length > 0 && (
        <ListGroup>
          {data!.items.map((checklistItem: RunStepChecklistItem, i: React.Key) => (
            <ChecklistItemElement checklistItem={checklistItem} refetch={refetch} key={i} />
          ))}
        </ListGroup>
      )}

      <div className={"d-flex justify-content-between mt-3"}>
        <div className={"d-flex gap-2"}>
          {canFinishOperation.current && (
            <div>
              <Button variant={"success"} onClick={() => finishOperation(runStep)}>
                Move out
              </Button>
            </div>
          )}

          {run.access.edit && !runStep.is_skipped && (
            <div>
              <Button variant={"primary"} onClick={() => skipOperation(runStep)}>
                Skip operation
              </Button>
            </div>
          )}

          {run.access.edit && runStep.is_skipped && (
            <div>
              <Button variant={"warning"} onClick={() => unSkipOperation(runStep)}>
                Unskip operation
              </Button>
            </div>
          )}
        </div>

        <div className={"d-flex gap-2"}>
          {runStep.next_step_id && (
            <div>
              <Link to={`/${environment}/operator/run/step/${runStep.next_step_id}`} className={"btn btn-secondary"}>
                Next step
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default RunStepChecklist;
