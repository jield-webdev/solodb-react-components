import React, { useContext } from "react";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";

export default function RunInformationElement() {
  const { run } = useContext(RunContext);

  return (
    <div>
      <h2>Run information</h2>

      <h3>Run name</h3>
      <p>{run.name}</p>

      <h3>Project name</h3>
      <p>{run.project.name}</p>
    </div>
  );
}
