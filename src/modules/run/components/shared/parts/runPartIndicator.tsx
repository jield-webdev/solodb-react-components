import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { RunPart, RunStep } from "@jield/solodb-typescript-core";

const RunPartIndicator = ({
  runPart,
  statusClass,
  withTrayCell = false,
  allowCreate = false,
  hasStepPart = false,
  runStep,
  reloadFn = () => {},
}: {
  runPart: RunPart | null;
  statusClass?: string;
  withTrayCell?: boolean;
  allowCreate?: boolean;
  hasStepPart?: boolean;
  runStep?: RunStep;
  reloadFn?: () => void;
}) => {
  const queryClient = useQueryClient();

  const createRunStepPart = () => {
    if (!runPart || !runStep) return;
    axios
      .post("/create/run/step/part", {
        run_part_id: runPart.id,
        run_step_id: runStep.id,
      })
      .then(() => {
        reloadFn();
        queryClient.invalidateQueries({
          queryKey: ["runSteps", "runStepParts"],
        });
      });
  };

  const badgeContent = (() => {
    if (!runPart) return null;
    if (allowCreate && !hasStepPart) {
      return (
        <Button
          size="sm"
          variant="outline-secondary"
          className="tray-grid__badge tray-grid__badge--init"
          onClick={createRunStepPart}
        >
          Init {runPart.label ?? runPart.short_label}
        </Button>
      );
    }

    return (
      <span className={`tray-grid__badge ${statusClass ?? "step-part-inactive"}`}>
        {runPart.label ?? runPart.short_label}
      </span>
    );
  })();

  if (!withTrayCell) return badgeContent;

  return <div className={`tray-grid__cell${runPart ? "" : " tray-grid__cell--empty"}`}>{badgeContent}</div>;
};

export default RunPartIndicator;
