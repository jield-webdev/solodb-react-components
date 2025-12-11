import React from "react";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { Link, useParams } from "react-router-dom";

const Process = ({ runStep }: { runStep: RunStep }) => {
  const { environment } = useParams();

  return (
    <h2>
      {" "}
      {runStep.number} -{runStep.process_module.process.name} on{" "}
      <Link to={`/${environment}/operator/equipment/${runStep.process_module.module.equipment.id}`}>
        {runStep.process_module.module.equipment.name} ({runStep.process_module.module.name})
      </Link>
    </h2>
  );
};

export default Process;
