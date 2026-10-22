import { useContext, useId, useState, type FormEvent } from "react";
import { useIsMutating } from "@tanstack/react-query";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { RunContext } from "../../../../contexts/runContext";
import useRunTrayMutation, { getRunTrayErrorMessage } from "../../../../hooks/useRunTrayMutation";
import type { RunTray } from "../../../../utils/runTrays";

export default function RunLayoutTrayActions({ tray, hasParts }: { tray: RunTray; hasParts: boolean }) {
  const { run } = useContext(RunContext);
  const mutation = useRunTrayMutation(run.id);
  const isMutating = useIsMutating({ mutationKey: ["runTray", run.id] }) > 0;
  const [show, setShow] = useState(false);
  const [name, setName] = useState(tray.name);
  const nameId = useId();

  const open = () => {
    mutation.reset();
    setName(tray.name);
    setShow(true);
  };
  const close = () => {
    if (!mutation.isPending) setShow(false);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || isMutating) return;
    mutation.mutate({ action: "rename", trayId: tray.id, name: name.trim() }, { onSuccess: () => setShow(false) });
  };

  return (
    <>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={open}
        disabled={isMutating}
        aria-label={`Edit ${tray.name}`}
      >
        Edit
      </Button>
      <Modal show={show} onHide={close} centered>
        <Modal.Header closeButton={!mutation.isPending}>
          <Modal.Title>Edit extra tray</Modal.Title>
        </Modal.Header>
        <Form onSubmit={save}>
          <Modal.Body>
            {mutation.isError && <Alert variant="danger">{getRunTrayErrorMessage(mutation.error)}</Alert>}
            <Form.Group controlId={nameId}>
              <Form.Label>Tray name</Form.Label>
              <Form.Control
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={128}
                required
                autoFocus
                disabled={isMutating}
              />
            </Form.Group>
            <Form.Text>
              Changes apply to every step in this run. Only trays that are empty in every step can be removed.
            </Form.Text>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-danger"
              className="me-auto"
              disabled={hasParts || isMutating}
              title={hasParts ? "This tray still contains parts in this step" : undefined}
              onClick={() =>
                mutation.mutate({ action: "delete", trayId: tray.id }, { onSuccess: () => setShow(false) })
              }
            >
              Remove tray
            </Button>
            <Button variant="secondary" onClick={close} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isMutating}>
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
