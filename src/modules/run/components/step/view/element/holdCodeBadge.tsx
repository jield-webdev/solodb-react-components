import React, { useContext, useState } from "react";
import HoldCodeModal from "@jield/solodb-react-components/modules/run/components/step/view/element/hold-code/holdCodeModal";
import { HoldCode as HoldCodeInterface } from "@jield/solodb-typescript-core";
import { Badge } from "react-bootstrap";
import { RunStepContext } from "@jield/solodb-react-components/modules/run/contexts/runStepContext";

const HoldCodeBadge = () => {
  const { run } = useContext(RunStepContext);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [runHoldCode, setRunHoldCode] = useState<HoldCodeInterface | undefined>(run.hold_code);

  const OpenHoldCode = () => {
    setModalShow(true); //Show the modal
    return;
  };

  return (
    <>
      {runHoldCode && (
        <span
          className={"badge handle"}
          style={{
            backgroundColor: runHoldCode.hold_code.back_color,
            color: runHoldCode.hold_code.front_color,
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
          onClick={() => OpenHoldCode()}
        >
          {runHoldCode.hold_code.code}
        </span>
      )}

      {!runHoldCode && (
        <Badge
          bg={"secondary"}
          className={"handle"}
          onClick={() => OpenHoldCode()}
          style={{
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          No hold code
        </Badge>
      )}

      <HoldCodeModal
        run={run}
        show={modalShow}
        setShow={setModalShow}
        runHoldCode={runHoldCode}
        setRunHoldCode={setRunHoldCode}
      />
    </>
  );
};

export default HoldCodeBadge;
