import React, { JSX, useState } from "react";
import { EquipmentModuleIssue } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleIssue";
import moment from "moment";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";
import { EquipmentModuleIssueAttachment } from "@/modules/equipment/interfaces/equipment/module/issue/equipmentModuleIssueAttachment";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import IssueModalForm from "@/modules/equipment/components/partial/issueModalForm";
import ReactMarkdown from "react-markdown";

function IssueTableRow({
  issue,
  moduleName,
  issueAttachments,
  equipment,
  reloadQueryFn,
}: {
  issue: EquipmentModuleIssue;
  moduleName: string | undefined;
  issueAttachments: EquipmentModuleIssueAttachment[];
  equipment: Equipment | undefined;
  reloadQueryFn: (key: string[]) => void;
}) {
  const [modalElement, setModalElement] = useState<JSX.Element | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Update currentIssue in state when a new issue arrives
  const reloadIssue = (updatedIssue: EquipmentModuleIssue) => {
    reloadQueryFn(["issue", "status_mail"]);
    reloadQueryFn(["issue", "attachment", "status_mail"]);
  };

  // Filter attachments for the current issue
  const findIssueAttachments = () => {
    return issueAttachments.filter((attachment) => attachment.issue.id === issue.id);
  };

  // Show modal: set showModal and prepare the modal element
  const handleShowModal = () => {
    if (!equipment) {
      console.error("equipment is null in the table");
      return;
    }
    setShowModal(true);
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
  };

  // Component return at top level
  return (
    <>
      <tr key={issue.id} className="align-middle">
        <td className="text-nowrap">{moduleName ?? "-"}</td>
        <td>{issue.issue}</td>
        <td>
          <ReactMarkdown>{issue.description}</ReactMarkdown>
        </td>
        <td className="text-nowrap">{moment(issue.forecast_up).format("DD MMMM YYYY")}</td>
        <td className="text-nowrap">{issue.owner.full_name}</td>
        <td className="text-center">
          <button type="button" className="btn btn-sm btn-outline-light" onClick={handleShowModal}>
            Edit
          </button>
        </td>
      </tr>
      {/* Render modal if needed */}
      {showModal && modalElement}
    </>
  );
}

interface IssueTableProps {
  issues: EquipmentModuleIssue[];
  modules: EquipmentModule[];
  issueAttachments: EquipmentModuleIssueAttachment[];
  reloadQueryFn: (key: string[]) => void;
}

export default function IssueTable({ issues, modules, issueAttachments, reloadQueryFn }: IssueTableProps) {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped table-bordered table-sm">
        <thead className="bg-primary text-white">
          <tr>
            <th scope="col">Module</th>
            <th scope="col">Issue</th>
            <th scope="col">Description</th>
            <th scope="col">Forecast Up</th>
            <th scope="col">Owner</th>
            <th scope="col" className="text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <IssueTableRow
              key={issue.id}
              issue={issue}
              moduleName={modules.find((m) => m.id === issue.module_id)?.name}
              issueAttachments={issueAttachments}
              equipment={modules.find((m) => m.id === issue.module_id)?.equipment}
              reloadQueryFn={reloadQueryFn}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
