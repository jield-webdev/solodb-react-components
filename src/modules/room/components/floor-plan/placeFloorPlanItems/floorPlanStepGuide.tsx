import { ReactNode } from "react";
import { Badge } from "react-bootstrap";
import { FloorPlanSelection } from "@jield/solodb-react-components/modules/room/hooks/useFloorPlanSelection";

const steps = ["Choose an item", "Place it on the map", "Adjust and finish"];

const activeStepFor = (selection: FloorPlanSelection | null) =>
  selection === null ? 0 : selection.kind === "draw" ? 1 : 2;

export default function FloorPlanStepGuide({
  selection,
  actions,
}: {
  selection: FloorPlanSelection | null;
  actions?: ReactNode;
}) {
  const activeStep = activeStepFor(selection);

  return (
    <div className="floor-plan-guide d-flex flex-wrap align-items-center gap-2 mb-2">
      <ol className="list-unstyled d-flex flex-wrap align-items-center gap-3 mb-0 small">
        {steps.map((step, index) => {
          const isActive = index === activeStep;

          return (
            <li
              key={step}
              className={"d-flex align-items-center gap-1" + (isActive ? " fw-semibold" : " text-muted")}
              aria-current={isActive ? "step" : undefined}
            >
              <Badge pill bg={isActive ? "primary" : index < activeStep ? "success" : "secondary"}>
                {index + 1}
              </Badge>
              {step}
            </li>
          );
        })}
      </ol>
      {actions && <div className="floor-plan-editor__toolbar d-flex flex-wrap gap-2 ms-auto">{actions}</div>}
    </div>
  );
}
