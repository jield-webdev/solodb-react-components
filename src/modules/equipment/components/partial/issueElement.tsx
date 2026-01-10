import React, { JSX, useState } from "react";
import { Badge, Button } from "react-bootstrap";
import IssueModalForm from "@jield/solodb-react-components/modules/equipment/components/partial/issueModalForm";
import moment from "moment/moment";
import ReactMarkdown from "react-markdown";
import { Equipment, EquipmentModuleIssue, EquipmentModuleIssueAttachment, EquipmentModuleIssueType } from "@jield/solodb-typescript-core";

export default function IssueElement({
  issue,
  equipment,
  issueAttachments,
  reloadQueryFn,
  expanded = true,
}: {
  issue: EquipmentModuleIssue;
  equipment: Equipment;
  issueAttachments: EquipmentModuleIssueAttachment[];
  reloadQueryFn: (key: string[]) => void;
  expanded?: boolean;
}) {
  const [modalElement, setModalElement] = useState<JSX.Element | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [isExpanded, setIsExpanded] = useState(expanded);

  // Function to reload the issue
  const reloadIssue = (updatedIssue: EquipmentModuleIssue) => {
    reloadQueryFn(["issue", "attachment", "status_mail"]);
    reloadQueryFn(["issue", "status_mail"]);
  };

  // The components give all attachments, but we only need those who are related to the issue
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
        issue={issue}
        attachments={findIssueAttachments()}
      />
    );

    setShowModal(true);
  };

  return (
    <div className="p-3 mb-4 border-bottom">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <Badge bg="dark">Issue</Badge>
          <h4 className={issue.date_closed ? "text-danger mb-0" : "mb-0"}>
            {issue.date_closed ? <s>{issue.issue}</s> : issue.issue}
          </h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label="Toggle Details"
          >
            {isExpanded ? "Hide Details" : "Show Details"}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleShowModal} aria-label="Edit Issue">
            Edit
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="mb-2">
            <ReactMarkdown>{issue.description}</ReactMarkdown>
          </div>
          <p className="mb-3">{issue.actions}</p>

          <div className="d-flex flex-wrap gap-4 text-muted">
            <div>
              <small className="text-muted">Creator</small>
              <div className="text-body">{issue.owner.full_name}</div>
            </div>

            <div>
              <small className="text-muted">Date Created</small>
              <div className="text-body">{moment(issue.date_created).format("DD MMMM YYYY")}</div>
            </div>

            {issue.date_closed && (
              <div>
                <small className="text-muted">Date Closed</small>
                <div className="text-body">{moment(issue.date_closed).format("DD MMMM YYYY")}</div>
              </div>
            )}

            <div>
              <small className="text-muted">Forecast Up</small>
              <div className="text-body">{moment(issue.forecast_up).format("DD MMMM YYYY")}</div>
            </div>

            <div>
              <small className="text-muted">Issue Type</small>
              <div className="text-body">
                {issue.issue_type === EquipmentModuleIssueType.DEFAULT && "Issue"}
                {issue.issue_type === EquipmentModuleIssueType.ESCALATION && "Escalation"}
                {issue.issue_type === EquipmentModuleIssueType.PRIORITY && "Priority"}
              </div>
            </div>

            <div>
              <small className="text-muted">Attachments</small>
              <div className="text-body">{issue.attachments}</div>
            </div>

            {issue.updated_by && (
              <div>
                <small className="text-muted">Last Update By</small>
                <div className="text-body">{issue.updated_by.full_name}</div>
              </div>
            )}

            {issue.last_update && (
              <div>
                <small className="text-muted">Last Update</small>
                <div className="text-body">{moment(issue.last_update).format("DD MMMM YYYY")}</div>
              </div>
            )}
          </div>
        </>
      )}

      {showModal && modalElement}
    </div>
  );
}
