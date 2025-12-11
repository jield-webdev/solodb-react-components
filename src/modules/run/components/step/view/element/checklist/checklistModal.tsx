import React from "react";
import { Button, Modal } from "react-bootstrap";
import { RunStepChecklistItem } from "@/modules/run/interfaces/step/runStepChecklistItem";

const ChecklistModal = ({
  checklistItem,
  show,
  setModalShow,
  mutation,
}: {
  checklistItem: RunStepChecklistItem;
  show: boolean;
  setModalShow: (show: boolean) => void;
  mutation: any;
}) => {
  const handleClose = () => setModalShow(false);

  return (
    <Modal show={show} size={"lg"} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Checklist item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h2>{checklistItem.task}</h2>
        <span
          dangerouslySetInnerHTML={{
            __html: checklistItem.description,
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={"float-end"}
          variant="primary"
          onClick={() => {
            mutation.mutate();
          }}
        >
          Done
        </Button>
        <Button variant="secondary" onClick={() => setModalShow(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChecklistModal;
