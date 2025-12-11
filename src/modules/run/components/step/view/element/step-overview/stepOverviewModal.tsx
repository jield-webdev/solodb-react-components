import React, { useContext, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";
import RunStepSimpleList from "@/modules/run/components/step/view/element/runStepSimpleList";

const StepOverviewModal = ({ show, setModalShow }: { show: boolean; setModalShow: any }) => {
  const { run } = useContext(RunStepContext);

  return (
    <Modal show={show} size={"xl"} onHide={() => setModalShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>All steps of run {run.label}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <RunStepSimpleList hideLabel={false} />
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={"float-end"}
          variant="secondary"
          onClick={() => {
            setModalShow(false); 
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StepOverviewModal;
