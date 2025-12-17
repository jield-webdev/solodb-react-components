import React from "react";
import { RunStepLabel } from "solodb-typescript-core";

const StepLabel = ({ label }: { label: RunStepLabel }) => {
  return <div className="p-2 h4 mb-1 bg-info text-white">{label.label}</div>;
};

export default StepLabel;
