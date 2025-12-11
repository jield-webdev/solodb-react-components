import React, { useContext, useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";

const InputModal = () => {
  const [modalShow, setModalShow] = useState<boolean>(false);
  const { modalProperties } = useContext(RunStepContext);

  const handleClose = () => {
    setModalShow(false);
    modalProperties.show = false;
  };

  useEffect(() => {
    setModalShow(modalProperties.show);
  }, [modalProperties]);

  return (
    <Modal show={modalShow} size={"xl"} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{modalProperties.modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{modalProperties.modalContent}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Save
        </Button>
        {modalProperties.modalSaveButton}
      </Modal.Footer>
    </Modal>
  );
};

export default InputModal;
