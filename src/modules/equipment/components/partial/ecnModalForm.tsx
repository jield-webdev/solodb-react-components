import React, { useContext, useEffect, useState } from "react";

import { Button, Form, Modal } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";
import ListModules from "@/modules/equipment/api/module/listModules";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { EquipmentModuleEcn } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleEcn";
import { EquipmentModuleEcnAttachment } from "@/modules/equipment/interfaces/equipment/module/ecn/equipmentModuleEcnAttachment";
import axios from "axios";
import UserFormElement from "@/modules/core/form/element/userFormElement";
import { AuthContext } from "@/modules/core/contexts/authContext";
import { fileToBase64 } from "@/modules/core/functions/fileToBase64";
import { EcnAttachmentPostType } from "@/modules/equipment/interfaces/ecnAttachmentPost";

interface EcnModalFormProps {
  equipment: Equipment;
  showModal: boolean;
  onClose: (equipmentModuleEcn?: EquipmentModuleEcn) => void;
  ecn?: EquipmentModuleEcn;
  attachments?: EquipmentModuleEcnAttachment[];
}

const EcnModalForm: React.FC<EcnModalFormProps> = ({ equipment, showModal, onClose, ecn, attachments }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [modules, setModules] = useState<EquipmentModule[]>([]);
  const { user } = useContext(AuthContext);

  const [attachmentsUpdated, setAttachmentsUpdated] = useState(attachments);

  // React Hook Form setup
  const { register, handleSubmit, reset, control } = useForm<EquipmentModuleEcn>({
    defaultValues: {
      ecn: ecn?.ecn || "",
      description: ecn?.description || "",
      module_id: ecn?.module_id || equipment?.main_tool_module_id || 0,
      owner: ecn?.owner || {},
    },
  });

  useEffect(() => {
    if (ecn) {
      reset({
        ecn: ecn?.ecn || "",
        description: ecn?.description || "",
        module_id: ecn?.module_id || equipment?.main_tool_module_id || 0,
        owner: ecn?.owner || {},
      });
    }
  }, []);

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
              await axios.delete(`/delete/equipment/module/ecn/attachment/${attachments[i].id}`);
            }
          }
        }

        if (filesToUpload.length > 0 && ecnId) {
          await Promise.all(
            filesToUpload.map(async (file) => {
              const base64Content = await fileToBase64(file);
              const attachement: EcnAttachmentPostType = {
                ecn_id: ecnId,
                filename: file.name,
                type: file.type,
                content: base64Content,
              };

              await axios.post(`/create/equipment/module/ecn/attachment`, attachement);
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
      let updatedEcn;

      const ecnData = {
        module_id: data.module_id,
        ecn: data.ecn,
        description: data.description,
        owner: data?.owner.value || ecn?.owner,
      };

      if (ecn) {
        await uploadFiles(files, ecn.id);

        // Update the issue via Axios
        const response = await axios.patch(`/update/equipment/module/ecn/${ecn?.id}`, ecnData);
        updatedEcn = response.data;
      } else {
        // Create the issue via Axios
        const response = await axios.post(`/create/equipment/module/ecn`, ecnData);
        updatedEcn = response.data;

        uploadFiles(files, updatedEcn.id);

        updatedEcn.attachments = files.length;
      }

      // Pass the updated issue data back to the parent
      onClose(updatedEcn);
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
  };

  async function handleClose() {
    await axios.delete(`/delete/equipment/module/ecn/${ecn?.id}`);

    //Closed means that the date_closed property is set on the updatedEcn, so we can do that here locally
    const updatedEcn = {
      ...ecn,
      date_closed: new Date().toISOString(),
      last_update: new Date().toISOString(),
      updated_by: user?.full_name,
    };

    onClose(updatedEcn as EquipmentModuleEcn);
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

  return (
    <Modal show={showModal} size="lg" centered onHide={onClose}>
      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>{ecn ? `Edit ECN for ${equipment.name}` : `Create New ECN for ${equipment.name}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!ecn && (
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

          {/* Description */}
          <Form.Group controlId="ecn" className="mb-3">
            <Form.Label>ECN</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter ECN"
              {...register("ecn", {
                required: "ECN is required",
              })}
            />
          </Form.Group>

          {/* Description Field */}
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter ECN description"
              {...register("description", {
                required: "Description is required",
              })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Owner</Form.Label>
            <UserFormElement
              control={control}
              {...register("owner", {
                required: "Owner is required",
              })}
              name={"owner"}
            />
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
          <Button variant="secondary" onClick={() => onClose(ecn)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {ecn ? "Update ECN" : "Create ECN"}
          </Button>
          {ecn && (
            <Button variant="danger" onClick={() => handleClose()}>
              Close ECN
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EcnModalForm;
