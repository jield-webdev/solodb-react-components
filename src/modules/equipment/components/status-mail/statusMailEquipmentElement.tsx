import React, { JSX, useEffect, useState } from "react";
import { Equipment } from "@/modules/equipment/interfaces/equipment";
import "./equipment.css";
import { EquipmentModuleIssue } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleIssue";
import { EquipmentModuleEcn } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleEcn";
import EcnElement from "@/modules/equipment/components/partial/ecnElement";
import IssueElement from "@/modules/equipment/components/partial/issueElement";
import ModuleStatusElement from "@/modules/equipment/components/partial/moduleStatusElement";
import { ButtonGroup, Card, Col, Dropdown, DropdownButton, Row } from "react-bootstrap";
import { EquipmentModule } from "@/modules/equipment/interfaces/equipment/equipmentModule";
import EcnModalForm from "@/modules/equipment/components/partial/ecnModalForm";
import { EquipmentModuleIssueAttachment } from "@/modules/equipment/interfaces/equipment/module/issue/equipmentModuleIssueAttachment";
import { EquipmentModuleEcnAttachment } from "@/modules/equipment/interfaces/equipment/module/ecn/equipmentModuleEcnAttachment";
import IssueModalForm from "@/modules/equipment/components/partial/issueModalForm";
import { EquipmentModuleReservation } from "@/modules/equipment/interfaces/equipment/module/equipmentModuleReservation";
import ReservationElement from "@/modules/equipment/components/partial/reservationElement";

export default function StatusMailEquipmentElement({
  equipment,
  modules,
  issues,
  issueAttachments,
  ecnNotes,
  ecnAttachments,
  reloadQueryFn,
  showIssues,
  reservations,
}: {
  equipment: Equipment;
  modules: EquipmentModule[];
  issues: EquipmentModuleIssue[];
  issueAttachments: EquipmentModuleIssueAttachment[];
  ecnNotes: EquipmentModuleEcn[];
  ecnAttachments: EquipmentModuleEcnAttachment[];
  reloadQueryFn: (key: string[]) => void;
  showIssues: 1 | 2 | 3;
  reservations: EquipmentModuleReservation[];
}) {
  const [issueModalElement, setIssueModalElement] = useState<JSX.Element | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const [ecnModalElement, setEcnModalElement] = useState<JSX.Element | null>(null);
  const [showEcnModal, setShowEcnModal] = useState<boolean>(false);

  const [equipmentModules, setEquipmentModules] = useState<EquipmentModule[]>([]);
  const [mainTool, setMainTool] = useState<EquipmentModule | undefined>(undefined);

  //Create a state for the ECN notes
  const [moduleEcnNotes, setModuleEcnNotes] = useState<EquipmentModuleEcn[]>([]);

  //And for the Issues
  const [moduleIssues, setModuleIssues] = useState<EquipmentModuleIssue[]>([]);

  //Filter the ECN notes and Issues by module and set the state
  const reloadECN = (equipmentModuleEcn: EquipmentModuleEcn) => {
    reloadQueryFn(["ecn", "attachment", "status_mail"]);
    setModuleEcnNotes([...moduleEcnNotes, equipmentModuleEcn]);
  };

  const reloadIssue = (equipmentModuleIssue: EquipmentModuleIssue) => {
    reloadQueryFn(["issue", "status_mail"]);
    reloadQueryFn(["issue", "attachment", "status_mail"]);
    setModuleIssues([...moduleIssues, equipmentModuleIssue]);
  };

  //Prefilter the ECN notes and Issues by module
  useEffect(() => {
    setModuleEcnNotes(ecnNotes);
    setModuleIssues(issues);

    setEquipmentModules(modules.filter((module) => module.equipment.id === equipment.id && !module.type.is_main_tool));
    setMainTool(modules.findLast((module) => module.equipment.id === equipment.id && module.type.is_main_tool));
  }, [ecnNotes, issues, equipment, modules]);

  //This element gets all ECN notes, but we only need those who are related to the module
  const findEcnNotes = (moduleId: number) => {
    return moduleEcnNotes.filter((ecnNote) => ecnNote.module_id === moduleId);
  };

  const findIssues = (moduleId: number) => {
    return moduleIssues.filter((issue) => issue.module_id === moduleId);
  };

  const handleEcnButton = () => {
    setEcnModalElement(
      <EcnModalForm
        equipment={equipment}
        showModal={true}
        onClose={(equipmentModuleEcn?: EquipmentModuleEcn) => {
          setShowEcnModal(false);
          if (equipmentModuleEcn) {
            reloadECN(equipmentModuleEcn);
          }
        }}
      />
    );

    setShowEcnModal(true);
  };

  const handleIssueButton = () => {
    setIssueModalElement(
      <IssueModalForm
        equipment={equipment}
        showModal={true}
        onClose={(equipmentModuleIssue?: EquipmentModuleIssue) => {
          setShowIssueModal(false);
          if (equipmentModuleIssue) {
            reloadIssue(equipmentModuleIssue);
          }
        }}
      />
    );

    setShowIssueModal(true);
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <h4 className="mb-0">
            {equipment.number} - {equipment.name}
          </h4>

          {mainTool && <ModuleStatusElement module={mainTool} />}
          {mainTool && (
            <ReservationElement
              reservations={reservations.filter((reservation) =>
                reservation.modules.some((moduleItem) => moduleItem.id === mainTool.id)
              )}
            />
          )}
        </div>

        <DropdownButton as={ButtonGroup} title="Action" id="bg-nested-dropdown">
          <Dropdown.Item eventKey="1" onClick={handleEcnButton}>
            New ECN
          </Dropdown.Item>
          {showIssues !== 1 && (
            <Dropdown.Item eventKey="1" onClick={handleIssueButton}>
              New Issue
            </Dropdown.Item>
          )}
        </DropdownButton>
      </div>

      <div className="card-body">
        <Row>
          {/* If there are no modules, the main tool card takes full width */}
          {mainTool && (
            <Col xs={12} md={equipmentModules.length > 0 ? 6 : 12}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title className="d-flex align-items-center">
                    <span>Main module</span>
                    <div className="ms-2"></div>
                  </Card.Title>
                  <div className="mt-3">
                    {findEcnNotes(mainTool.id).map((ecnNote, index) => (
                      <EcnElement
                        ecn={ecnNote}
                        key={index}
                        equipment={equipment}
                        ecnAttachments={ecnAttachments}
                        reloadQueryFn={reloadQueryFn}
                        expanded={true}
                      />
                    ))}

                    {showIssues !== 1 &&
                      findIssues(mainTool.id).map((issue, index) => (
                        <IssueElement
                          issue={issue}
                          key={index}
                          equipment={equipment}
                          issueAttachments={issueAttachments}
                          reloadQueryFn={reloadQueryFn}
                          expanded={showIssues !== 3}
                        />
                      ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Modules section - only shown if there are modules */}
          {equipmentModules.length > 0 && (
            <Col xs={12} md={mainTool ? 6 : 12}>
              {equipmentModules.map((module: EquipmentModule, index: number) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <Card.Title className="d-flex align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <span>{module.name}</span>
                        <ModuleStatusElement module={module} />
                        <ReservationElement
                          reservations={reservations.filter((reservation) =>
                            reservation.modules.some((moduleItem) => moduleItem.id === module.id)
                          )}
                        />
                      </div>
                    </Card.Title>
                    <div className="mt-3">
                      {findEcnNotes(module.id).map((ecnNote, index) => (
                        <EcnElement
                          ecn={ecnNote}
                          key={index}
                          equipment={equipment}
                          ecnAttachments={ecnAttachments}
                          reloadQueryFn={reloadQueryFn}
                          expanded={true}
                        />
                      ))}

                      {showIssues !== 1 &&
                        findIssues(module.id).map((issue, index) => (
                          <IssueElement
                            issue={issue}
                            key={index}
                            equipment={equipment}
                            issueAttachments={issueAttachments}
                            reloadQueryFn={reloadQueryFn}
                            expanded={showIssues !== 3}
                          />
                        ))}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Col>
          )}
        </Row>
      </div>
      {showEcnModal && ecnModalElement}
      {showIssueModal && issueModalElement}
    </div>
  );
}
