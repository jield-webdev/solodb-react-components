import React, { JSX, useState } from "react";
import { EquipmentModuleEcn } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleEcn";
import EcnModalForm from "@/modules/equipment/components/partial/ecnModalForm";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import { Badge, Button } from "react-bootstrap";
import { EquipmentModuleEcnAttachment } from "@/modules/equipment/interfaces/equipment/module/ecn/equipmentModuleEcnAttachment";
import moment from "moment";
import ReactMarkdown from "react-markdown";

export default function EcnElement({
  ecn,
  equipment,
  ecnAttachments,
  reloadQueryFn,
  expanded = true,
}: {
  ecn: EquipmentModuleEcn;
  equipment: Equipment;
  ecnAttachments: EquipmentModuleEcnAttachment[];
  reloadQueryFn: (key: string[]) => void;
  expanded?: boolean;
}) {
  const [modalElement, setModalElement] = useState<JSX.Element | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentEcn, setCurrentEcn] = useState(ecn);

  const [isExpanded, setIsExpanded] = useState(expanded);

  const reloadECN = (updatedEcn: EquipmentModuleEcn) => {
    reloadQueryFn(["ecn", "attachment", "status_mail"]);
    setCurrentEcn({
      ...currentEcn,
      ...updatedEcn,
    });
  };

  //The components give all attachments, but we only need those who are related to the ECN
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
            reloadQueryFn(["ecn", "attachment", "status_mail"]);
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
    <div className="p-3 mb-4 border-bottom">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <Badge bg="dark">ECN</Badge>
          <h4 className={currentEcn.date_closed ? "text-danger mb-0" : "mb-0"}>
            {currentEcn.date_closed ? <s>{currentEcn.ecn}</s> : currentEcn.ecn}
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
          <Button variant="secondary" size="sm" onClick={handleShowModal} aria-label="Edit ECN">
            Edit
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="mb-3">
            <ReactMarkdown>{currentEcn.description}</ReactMarkdown>
          </div>

          <div className="d-flex flex-wrap text-muted">
            <div className="flex-fill pe-3 mb-2">
              <small className="text-muted">Creator</small>
              <div className="text-body">{currentEcn.owner.full_name}</div>
            </div>

            <div className="flex-fill pe-3 mb-2">
              <small className="text-muted">Date Created</small>
              <div className="text-body">{moment(currentEcn.date_created).format("DD MMMM YYYY")}</div>
            </div>

            {currentEcn.date_closed && (
              <div className="flex-fill pe-3 mb-2">
                <small className="text-muted">Date Closed</small>
                <div className="text-danger">{moment(currentEcn.date_closed).format("DD MMMM YYYY")}</div>
              </div>
            )}

            <div className="flex-fill pe-3 mb-2">
              <small className="text-muted">Attachments</small>
              <div className="text-body">{currentEcn.attachments}</div>
            </div>

            {currentEcn.updated_by && (
              <div className="flex-fill pe-3 mb-2">
                <small className="text-muted">Last Update By</small>
                <div className="text-body">{currentEcn.updated_by.full_name}</div>
              </div>
            )}

            {currentEcn.last_update && (
              <div className="flex-fill pe-3 mb-2">
                <small className="text-muted">Last Update</small>
                <div className="text-body">{moment(currentEcn.last_update).format("DD MMMM YYYY")}</div>
              </div>
            )}
          </div>
        </>
      )}

      {showModal && modalElement}
    </div>
  );
}
