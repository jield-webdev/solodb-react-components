import React, { useState } from "react";
import { Button } from "react-bootstrap";
import StepOverviewModal from "@jield/solodb-react-components/modules/run/components/step/view/element/step-overview/stepOverviewModal";

const StepOverviewButton = ({ size }: { size?: "lg" | "sm" | undefined }) => {
  const [modalShow, setModalShow] = useState<boolean>(false);

  return (
    <React.Fragment>
      <Button size={size} variant="primary" onClick={() => setModalShow(true)}>
        All run steps
      </Button>

      {modalShow && <StepOverviewModal show={modalShow} setModalShow={setModalShow} />}
    </React.Fragment>
  );
};

export default StepOverviewButton;
