import React, { useState } from "react";
import { Button, Form, Modal, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios";

const LogAssistElement = ({ moduleId, size  }: { moduleId: number; size: "lg" | "sm" | undefined }) => {
  //We need a local variable to save the form content to prevent that the information is already shown
  //on the alert even before we submit
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [toastShow, setToastShow] = useState<boolean>(false);
  const [modalIssueContent, setModalIssueContent] = useState<string>("");

  function createIssue() {
    axios
      .create()
      .post("create/equipment/module/changelog", {
        module: moduleId,
        changelog: modalIssueContent,
      })
      .finally(() => {
        setModalShow(false);
        setToastShow(true);
        setModalIssueContent("");
      });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setModalIssueContent(e.target.value);
  };

  function NotificationToast() {
    return (
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setToastShow(false)} show={toastShow} delay={3000} autohide bg={"light"}>
          <Toast.Header>
            <strong className="me-auto">Assist logged</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body>Assist was logged successfully</Toast.Body>
        </Toast>
      </ToastContainer>
    );
  }

  return (
    <>
      <Button variant="primary" size={size} onClick={() => setModalShow(true)}>
        Log assist
      </Button>
      <Modal show={modalShow} size={"lg"} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Log assist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="modal.ControlTextarea1">
              <Form.Label>Describe the assist</Form.Label>
              <Form.Control as="textarea" rows={3} value={modalIssueContent} onChange={(e) => handleChange(e)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className={"float-end"} variant="primary" onClick={() => createIssue()}>
            Log assist
          </Button>
          <Button
            className={"float-end"}
            variant="secondary"
            onClick={() => {
              setModalShow(false); //Close the modal
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <NotificationToast />
    </>
  );
};

export default LogAssistElement;
