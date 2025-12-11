import React, { useContext, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";
import ListModules from "@/modules/equipment/api/module/listModules";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import {
  EquipmentModuleIssue,
  EquipmentModuleIssueStatus,
  EquipmentModuleIssueType,
} from "@/modules/equipment/interfaces/equipment/module/equipmentModuleIssue";
import { EquipmentModuleIssueAttachment } from "@/modules/equipment/interfaces/equipment/module/issue/equipmentModuleIssueAttachment";
import axios from "axios";
import UserFormElement from "@/modules/core/form/element/userFormElement";
import { AuthContext } from "@/modules/core/contexts/authContext";
import { fileToBase64 } from "@/modules/core/functions/fileToBase64";
import { IssueAttachmentPostType } from "@/modules/equipment/interfaces/issueAttachmentPost";

interface IssueModalFormProps {
  equipment: Equipment;
  showModal: boolean;
  onClose: (equipmentModuleIssue?: EquipmentModuleIssue) => void;
  issue?: EquipmentModuleIssue;
  attachments?: EquipmentModuleIssueAttachment[];
}

const IssueModalForm: React.FC<IssueModalFormProps> = ({ equipment, showModal, onClose, issue, attachments }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [modules, setModules] = useState<EquipmentModule[]>([]);
  const { user } = useContext(AuthContext);

  const [attachmentsUpdated, setAttachmentsUpdated] = useState(attachments);

  // React Hook Form setup
  const { register, handleSubmit, reset, control } = useForm<EquipmentModuleIssue>({
    defaultValues: {
      issue: issue?.issue || "",
      description: issue?.description || "",
      issue_type: issue?.issue_type || EquipmentModuleIssueType.DEFAULT,
      status: issue?.status || EquipmentModuleIssueStatus.ACTIVE,
      forecast_up: issue?.forecast_up ? new Date(issue?.forecast_up).toISOString().split("T")[0] : "",
      actions: issue?.actions || "",
      owner: issue?.owner || {},
    },
  });

  // UseEffect to reset form values when initialData changes
  useEffect(() => {
    if (issue) {
      // Reset form with new initialData
      reset({
        issue: issue?.issue || "",
        description: issue?.description || "",
        issue_type: issue?.issue_type || EquipmentModuleIssueType.DEFAULT,
        status: issue?.status || EquipmentModuleIssueStatus.ACTIVE,
        forecast_up: issue?.forecast_up ? new Date(issue?.forecast_up).toISOString().split("T")[0] : "",
        actions: issue?.actions || "",
        owner: issue?.owner || {},
      });
    }
  }, [issue, reset]);

  // React Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/*": [], "image/*": [] },
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
  });

  // Fetch modules when modal opens
  useEffect(() => {
    if (showModal) {
      const fetchModules = async () => {
        if (!equipment?.id) return;

        try {
          const response = await ListModules({
            equipment: equipment,
          });
          setModules(response.items || []);
        } catch (error) {
          console.error("Error fetching modules:", error);
        }
      };

      fetchModules();
    }
  }, [equipment, showModal]);

  async function handleClose() {
    await axios.delete(`/delete/equipment/module/issue/${issue?.id}`);

    //Closed means that the date_closed property is set on the updatedEcn, so we can do that here locally
    const updatedIssue = {
      ...issue,
      date_closed: new Date().toISOString(),
      last_update: new Date().toISOString(),
      updated_by: user?.full_name,
    };

    onClose(updatedIssue as EquipmentModuleIssue);
  }

  const removeToUploadFiles = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAlreadyUploadedFiles = (index: number) => {
    if (!attachmentsUpdated) {
      return;
    }

    setAttachmentsUpdated((prev) => prev?.filter((_, i) => i !== index));
  };

  // Convert and upload attachments
  const uploadFiles = (filesToUpload: File[], ecnId: number) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (attachmentsUpdated && attachments && attachments != attachmentsUpdated) {
          for (let i = 0; i < attachments.length; i++) {
            const old = attachments[i].id;
            let exist: boolean = false;
            for (let j = 0; j < attachmentsUpdated.length; j++) {
              const updated = attachmentsUpdated[j].id;
              if (old == updated) {
                exist = true;
                break;
              }
            }

            if (!exist) {
              await axios.delete(`/delete/equipment/module/issue/attachment/${attachments[i].id}`);
            }
          }
        }

        if (filesToUpload.length > 0 && ecnId) {
          await Promise.all(
            filesToUpload.map(async (file) => {
              const base64Content = await fileToBase64(file);
              const attachement: IssueAttachmentPostType = {
                issue_id: ecnId,
                filename: file.name,
                type: file.type,
                content: base64Content,
              };

              await axios.post(`/create/equipment/module/issue/attachment`, attachement);
            })
          );
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  // Submit logic
  const handleFormSubmit = async (data: any) => {
    try {
      let updatedIssue;

      const issueData = {
        module_id: data.module_id,
        issue: data.issue,
        description: data.description,
        owner: data?.owner.value || issue?.owner,
        status: data.status,
        issue_type: data.issue_type,
        actions: data.actions,
        forecast_up: data.forecast_up,
      };

      if (issue) {
        await uploadFiles(files, issue.id);
        // Update the issue via Axios
        const response = await axios.patch(`/update/equipment/module/issue/${issue?.id}`, issueData);
        updatedIssue = response.data;
      } else {
        // Create the issue via Axios
        const response = await axios.post(`/create/equipment/module/issue`, issueData);
        updatedIssue = response.data;

        uploadFiles(files, updatedIssue.id);

        updatedIssue.attachments = files.length;
      }

      // Pass the updated issue data back to the parent
      onClose(updatedIssue);
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
  };

  // Fetch modules when modal opens
  useEffect(() => {
    if (showModal) {
      const fetchModules = async () => {
        if (!equipment?.id) return;

        try {
          const response = await ListModules({
            equipment: equipment,
          });
          setModules(response.items || []);
        } catch (error) {
          console.error("Error fetching modules:", error);
        }
      };

      fetchModules();
    }
  }, [equipment, showModal]);

  return (
    <Modal show={showModal} size="lg" centered onHide={() => onClose(issue)}>
      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {issue ? `Edit Issue for ${equipment.name}` : `Create new Issue for ${equipment.name}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!issue && (
            <Form.Group controlId="module" className="mb-3">
              <Form.Label>Module</Form.Label>
              <Form.Select
                {...register("module_id", {
                  required: "Module is required",
                })}
              >
                <option value="">— Select a module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group controlId="issue">
            <Form.Label>Issue</Form.Label>
            <Form.Control
              type="text"
              {...register("issue", {
                required: "Issue content is required",
              })}
              autoFocus
            />
          </Form.Group>

          {/* Description */}
          <Form.Group controlId="description" className="mt-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register("description", {
                required: "Description is required",
              })}
            />
          </Form.Group>

          {/* Issue Type as a Dropdown */}
          <Form.Group controlId="issueType" className="mt-3">
            <Form.Label>Issue</Form.Label>
            <Form.Control
              as="select"
              {...register("issue_type", {
                required: "Issue type is required",
              })}
            >
              <option value={EquipmentModuleIssueType.DEFAULT}>Default</option>
              <option value={EquipmentModuleIssueType.PRIORITY}>Priority</option>
              <option value={EquipmentModuleIssueType.ESCALATION}>Escalation</option>
            </Form.Control>
          </Form.Group>

          {/* Status as a Dropdown */}
          <Form.Group controlId="status" className="mt-3">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              {...register("status", {
                required: "Status is required",
              })}
            >
              <option value={EquipmentModuleIssueStatus.ACTIVE}>Active</option>
              <option value={EquipmentModuleIssueStatus.CLOSED}>Closed</option>
            </Form.Control>
          </Form.Group>

          <Form.Group className={"mb-3"}>
            <Form.Label>Owner</Form.Label>
            <UserFormElement
              control={control}
              {...register("owner", {
                required: "Owner is required",
              })}
              name={"owner"}
            />
          </Form.Group>

          {/* Forecast Up */}
          <Form.Group controlId="forecastUp" className="mt-3">
            <Form.Label>Forecast Up</Form.Label>
            <Form.Control
              type="date"
              {...register("forecast_up", {
                required: "Forecast Up date is required",
              })}
            />
          </Form.Group>

          {/* Actions */}
          <Form.Group controlId="actions" className="mt-3">
            <Form.Label>Actions</Form.Label>
            <Form.Control as={"textarea"} rows={5} {...register("actions", { required: false })} />
          </Form.Group>

          {/* File Dropzone */}
          <Form.Group>
            <Form.Label>Attachments</Form.Label>
            <div
              {...getRootProps({
                className: `dropzone ${isDragActive ? "active" : ""}`,
                style: {
                  border: "2px dashed #007bff",
                  padding: "10px",
                  textAlign: "center",
                },
              })}
            >
              <input {...getInputProps()} />
              {isDragActive ? <p>Drop the files here...</p> : <p>Drag & drop files here, or click to select files</p>}
            </div>
            {/* Display uploaded files */}
            {files.length > 0 && (
              <ul>
                {files.map((file, index) => (
                  <li key={index}>
                    {file.name}{" "}
                    <Button variant="secondary" onClick={() => removeToUploadFiles(index)}>
                      cancel
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Form.Group>

          {attachmentsUpdated && attachmentsUpdated.length > 0 && (
            <Form.Group controlId="uploaded_files" className="mt-3">
              <Form.Label>Uploaded files</Form.Label>
              <ul>
                {attachmentsUpdated.map((attachment, index) => (
                  <li key={index}>
                    {attachment.filename}{" "}
                    <Button variant="secondary" onClick={() => removeAlreadyUploadedFiles(index)}>
                      delete
                    </Button>
                  </li>
                ))}
              </ul>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => onClose(issue)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {issue ? "Update Issue" : "Create Issue"}
          </Button>
          {issue && (
            <Button variant="danger" onClick={() => handleClose()}>
              Close Issue
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default IssueModalForm;
