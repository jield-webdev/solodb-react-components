import React, { useState } from "react";
import { Button } from "react-bootstrap";
import RunChangelogModal from "@/modules/run/components/step/view/element/run-changelog/runChangelogModal";

const RunChangelogButton = ({ size }: { size?: "lg" | "sm" | undefined }) => {
  const [modalShow, setModalShow] = useState<boolean>(false);

  return (
    <>
      <Button size={size} variant="primary" onClick={() => setModalShow(!modalShow)}>
        Run history
      </Button>
      {modalShow && <RunChangelogModal show={modalShow} setModalShow={setModalShow} />}
    </>
  );
};

export default RunChangelogButton;
