import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form"; // react-hook-form for managing form
import axios from "axios"; // axios for server calls
import { Badge, Button, Form, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { EquipmentModule, EquipmentModuleStatus, EquipmentStatus, listEquipmentStatus } from "solodb-typescript-core";

type Inputs = {
  status: string;
  description: string;
  email_responsible_users: boolean;
  email_trained_users: boolean;
};

export default function ModuleStatusElement({ module, refetchFn = () => {} }: { module: EquipmentModule; refetchFn?: () => void;  }) {
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [formState, setFormState] = useState<string>("Save");
  const [statusOptions, setStatusOptions] = useState<EquipmentStatus[]>([]); // State for status options

  //Create a state for the status so we can update the status of the module
  const [moduleStatus, setModuleStatus] = useState<EquipmentModuleStatus | undefined>(module.latest_module_status);

  // Update moduleStatus when module.latest_module_status changes
  useEffect(() => {
    setModuleStatus(module.latest_module_status);
  }, [module.latest_module_status]);

  const { register, handleSubmit, reset } = useForm<Inputs>(); // Form state management

  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    if (showModal && statusOptions.length > 0) {
      reset({
        status: moduleStatus ? moduleStatus.status.id.toString() : "",
        description: moduleStatus ? moduleStatus.description : "",
        email_responsible_users: false,
        email_trained_users: false,
      });
    }
  }, [showModal, statusOptions]);

  useEffect(() => {
    if (showModal) {
      async function fetchStatusOptions() {
        try {
          const response = await listEquipmentStatus();
          setStatusOptions(response.items);
        } catch (error) {
          console.error("Failed to fetch status options:", error);
        }
      }

      fetchStatusOptions();
    }
  }, [showModal]);

  const onSubmit = async (data: Inputs) => {
    setFormState("Saving...");
    try {
      let postData: any = {
        module: module.id,
        status: Number(data.status),
        description: data.description,
      };

      if (data.email_responsible_users) {
        postData.email_responsible_users = Boolean(data.email_responsible_users);
      }

      if (data.email_trained_users) {
        postData.email_trained_users = Boolean(data.email_trained_users);
      }

      // Send the updated status to the server
      let result = await axios.post<EquipmentModuleStatus>(`/create/equipment/module/status`, postData);

      setFormState("Save");
      setModuleStatus(result.data);
      refetchFn();

      handleCloseModal();
    } catch (error) {
      setFormState("The saving failed");
      console.error("Failed to update status:", error);
    }
  };

  return (
    <>
      {moduleStatus ? (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-${moduleStatus.status.id}`}>
              {moduleStatus.description || "No description available"}
            </Tooltip>
          }
        >
          <div
            className="badge"
            style={{
              color: moduleStatus.status.front_color,
              backgroundColor: moduleStatus.status.back_color,
              cursor: "pointer",
            }}
            onClick={handleOpenModal}
          >
            {moduleStatus.status?.status}
          </div>
        </OverlayTrigger>
      ) : (
        <OverlayTrigger placement="top" overlay={<Tooltip>No status available</Tooltip>}>
          <Badge pill bg="primary" onClick={handleOpenModal} style={{ cursor: "pointer" }}>
            No status
          </Badge>
        </OverlayTrigger>
      )}

      {/* Modal for updating status */}
      <Modal show={showModal} onHide={handleCloseModal} size={"lg"}>
        <Modal.Header closeButton>
          <Modal.Title>Update Module Status {module.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Group className={"mb-3"}>
              <Form.Label>Status</Form.Label>
              <Form.Select {...register("status", { required: true })}>
                {statusOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className={"mb-3"}>
              <Form.Label>Description</Form.Label>
              {/* Input field */}
              <Form.Control
                type="text"
                as={"textarea"}
                rows={12}
                {...register("description", { required: true })}
                placeholder="Optional descriptio for the status update"
              />
            </Form.Group>

            <Form.Group className={"mb-3"}>
              <Form.Check
                type="switch"
                id={"email_responsible_users"}
                label="Email responsible users"
                {...register("email_responsible_users")}
              />
              <Form.Check
                type="switch"
                id={"email_trained_users"}
                label="Email trained users"
                {...register("email_trained_users")}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {formState}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
