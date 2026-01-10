import React, { JSX, useState } from "react";
import { Badge, Button, Card, ListGroup } from "react-bootstrap";
import { formatDateTime } from "@/utils/datetime";
import EcnModalForm from "@/modules/equipment/components/partial/ecnModalForm";
import ReactMarkdown from "react-markdown";
import { Equipment, EquipmentModuleEcn, EquipmentModuleEcnAttachment } from "@jield/solodb-typescript-core";

export default function EcnCard({
  ecn,
  equipment,
  ecnAttachments,
  reloadQueryFn,
}: {
  ecn: EquipmentModuleEcn;
  equipment: Equipment;
  ecnAttachments: EquipmentModuleEcnAttachment[];
  reloadQueryFn: (key: string[]) => void;
}) {
  const [modalElement, setModalElement] = useState<JSX.Element | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentEcn, setCurrentEcn] = useState(ecn);

  const reloadECN = (updatedEcn: EquipmentModuleEcn) => {
    reloadQueryFn(["ecn", equipment.name]);
    reloadQueryFn(["ecn", "attachment", equipment.name]);
    setCurrentEcn({
      ...currentEcn,
      ...updatedEcn,
    });
  };
  const findEcnAttachments = () => {
    return ecnAttachments.filter((attachment) => attachment.ecn.id === ecn.id);
  };

  const handleShowModal = () => {
    setModalElement(
      <EcnModalForm
        equipment={equipment}
        showModal={true}
        onClose={(equipmentModuleEcn?: EquipmentModuleEcn) => {
          setShowModal(false);
          if (equipmentModuleEcn) {
            reloadECN(equipmentModuleEcn);
          }
        }}
        ecn={currentEcn}
        attachments={findEcnAttachments()}
      />
    );

    setShowModal(true);
  };

  return (
    <div>
      <Card className="my-2" key={ecn.module_id}>
        <Card.Body>
          <div className="d-flex justify-content-between">
            <Card.Title>
              <Badge bg="dark">ECN</Badge> {ecn.ecn}
            </Card.Title>
            <Button variant="secondary" size="sm" onClick={handleShowModal}>
              Edit
            </Button>
          </div>
          <Card.Text>
            <ReactMarkdown>{ecn.description}</ReactMarkdown>
          </Card.Text>
        </Card.Body>

        <ListGroup className="list-group-flush">
          {currentEcn.date_created && (
            <ListGroup.Item className="d-flex align-items-center">
              <span className="text-muted">Created:</span>
              <span className="ms-1">{formatDateTime(currentEcn.date_created, "DD-MM-YY HH:mm")}</span>
            </ListGroup.Item>
          )}

          {currentEcn.owner && (
            <ListGroup.Item className="d-flex align-items-center">
              <span className="text-muted">Owner:</span>
              <span className="ms-1">{currentEcn.owner.full_name}</span>
            </ListGroup.Item>
          )}

          {currentEcn.updated_by && (
            <ListGroup.Item className="d-flex align-items-center">
              <span className="text-muted">Updated:</span>
              <span className="ms-1">{currentEcn.updated_by.full_name}</span>
              <span className="ms-1">({formatDateTime(currentEcn.last_update, "DD-MM-YY HH:mm")})</span>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>

      {showModal && modalElement}
    </div>
  );
}
