import React, { useContext, useState } from "react";
import { Priority as PriorityInterface } from "@jield/solodb-typescript-core";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";

const PriorityBadge = () => {
  const { run } = useContext(RunStepContext);
  const [runPriority, setRunPriority] = useState<PriorityInterface | undefined>(run.priority);

  return (
    <React.Fragment>
      {runPriority && (
        <span
          className={"badge"}
          style={{
            backgroundColor: runPriority.priority.back_color,
            color: runPriority.priority.front_color,
            fontSize: "1.5rem",
          }}
        >
          {runPriority.priority.code}
        </span>
      )}

      {!runPriority && (
        <span
          className={"badge bg-info"}
          style={{
            fontSize: "1.5rem",
          }}
        >
          NORMAL
        </span>
      )}
    </React.Fragment>
  );
};

export default PriorityBadge;
