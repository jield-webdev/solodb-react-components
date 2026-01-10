import React, { JSX, useState } from "react";
import { Badge, Button, Card, ListGroup } from "react-bootstrap";
import IssueModalForm from "@/modules/equipment/components/partial/issueModalForm";
import ReactMarkdown from "react-markdown";
import { formatDateTime } from "@/utils/datetime";
import { Equipment, EquipmentModuleIssue, EquipmentModuleIssueAttachment } from "@jield/solodb-typescript-core";

export default function IssueCard({
  issue,
  equipment,
  issueAttachments,
  reloadQueryFn,
}: {
  issue: EquipmentModuleIssue;
  equipment: Equipment;
  issueAttachments: EquipmentModuleIssueAttachment[];
  reloadQueryFn: (key: string[]) => void;
}) {
  const [modalElement, setModalElement] = useState<JSX.Element | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(issue);

  const reloadIssue = (updatedEcn: EquipmentModuleIssue) => {
    reloadQueryFn(["issue", equipment.name]);
    reloadQueryFn(["issue", "attachment", equipment.name]);
    setCurrentIssue({
      ...currentIssue,
      ...updatedEcn,
    });
  };
  const findIssueAttachments = () => {
    return issueAttachments.filter((attachment) => attachment.issue.id === issue.id);
  };

  const handleShowModal = () => {
    setModalElement(
      <IssueModalForm
        equipment={equipment}
        showModal={true}
        onClose={(equipmentModuleIssue?: EquipmentModuleIssue) => {
          setShowModal(false);
          if (equipmentModuleIssue) {
            reloadIssue(equipmentModuleIssue);
          }
        }}
        issue={currentIssue}
        attachments={findIssueAttachments()}
      />
    );

    setShowModal(true);
  };

  return (
    <div>
      <Card className="my-2" key={currentIssue.module_id}>
        <Card.Body>
          <div className="d-flex justify-content-between">
            <Card.Title>
              <Badge bg="dark">Issue</Badge> {currentIssue.issue}
            </Card.Title>
            <Button variant="secondary" size="sm" onClick={handleShowModal}>
              Edit
            </Button>
          </div>
          <Card.Text>
            <ReactMarkdown>{currentIssue.description}</ReactMarkdown>
          </Card.Text>
        </Card.Body>

        <ListGroup className="list-group-flush">
          {currentIssue.date_created && (
            <ListGroup.Item className="d-flex align-items-center">
              <span className="text-muted">Created:</span>
              <span className="ms-1">{formatDateTime(currentIssue.date_created, "DD-MM-YY HH:mm")}</span>
            </ListGroup.Item>
          )}

          {currentIssue.owner && (
            <ListGroup.Item className="d-flex align-items-center">
              <span className="text-muted">Owner:</span>
              <span className="ms-1">{currentIssue.owner.full_name}</span>
            </ListGroup.Item>
          )}

          {currentIssue.updated_by && (
            <ListGroup.Item className="d-flex align-items-center">
              <span className="text-muted">Updated:</span>
              <span className="ms-1">{currentIssue.updated_by.full_name}</span>
              <span className="ms-1">({formatDateTime(currentIssue.last_update, "DD-MM-YY HH:mm")})</span>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>

      {showModal && modalElement}
    </div>
  );
}
