import { createRun, createRunParent, createRunSubstrate, type Run } from "@jield/solodb-typescript-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Nav } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { type ParentRunSelectionState, useParentRunSelection } from "../../hooks/useParentRunSelection";
import { buildRunParentPayloads } from "../../utils/buildRunParentPayloads";
import ParentRunSelect from "../shared/parentRuns/parentRunSelect";
import CreateRunForm, { type CreateRunFormValues } from "./createRunForm/createRunForm";
import { getCreateRunErrorMessage } from "./getCreateRunErrorMessage";
import SubstrateSelect, { type SelectedSubstrate } from "./substrateSelect";

type WizardPage = "parts" | "substrate" | "details";

type CreateRunVariables = {
  runValues: CreateRunFormValues;
  parentRuns: ParentRunSelectionState;
  substrates: SelectedSubstrate[];
};

export default function NewRunWizard() {
  const { environment } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState<WizardPage>("parts");
  const [selectedSubstrates, setSelectedSubstrates] = useState<SelectedSubstrate[]>([]);
  const parentRunSelection = useParentRunSelection();

  const createRunMutation = useMutation({
    mutationFn: async ({ runValues, parentRuns, substrates }: CreateRunVariables): Promise<Run> => {
      const createdRun = await createRun({
        name: runValues.name,
        motivation: runValues.motivation,
        group_id: runValues.groupId,
        team_id: runValues.teamId,
        project_id: runValues.projectId,
        parts: runValues.parts,
        location: runValues.location || null,
        run_type: runValues.runType,
      });

      const parentPromises = buildRunParentPayloads(createdRun.id, parentRuns).map((payload) =>
        createRunParent(payload)
      );

      const substratePromises = substrates.map(({ substrate, amount }) =>
        createRunSubstrate({
          run_id: createdRun.id,
          substrate_id: substrate.id,
          amount,
        })
      );

      await Promise.all([...parentPromises, ...substratePromises]);

      return createdRun;
    },
    onSuccess: (run, variables) => {
      queryClient.invalidateQueries({ queryKey: [environment] });
      queryClient.invalidateQueries({ queryKey: [run.id] });
      variables.parentRuns.selectedRuns.forEach((parentRun) => {
        queryClient.invalidateQueries({ queryKey: [parentRun.id] });
      });
      navigate(`/${environment}/run/${run.id}/information.html`);
    },
  });

  return (
    <div>
      {activePage !== "details" && (
        <Nav
          variant="tabs"
          activeKey={activePage}
          onSelect={(eventKey) => {
            if (eventKey === "parts" || eventKey === "substrate") {
              setActivePage(eventKey);
            }
          }}
          className="mb-4"
        >
          <Nav.Item>
            <Nav.Link eventKey="parts">Parent run and parts</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="substrate">Select Substrate</Nav.Link>
          </Nav.Item>
        </Nav>
      )}

      <div className="m-3">
        {activePage === "parts" && <ParentRunSelect selection={parentRunSelection} />}

        {activePage === "substrate" && (
          <SubstrateSelect selectedSubstrates={selectedSubstrates} setSelectedSubstrates={setSelectedSubstrates} />
        )}

        {activePage === "details" && (
          <CreateRunForm
            isSubmitting={createRunMutation.isPending}
            errorMessage={createRunMutation.isError ? getCreateRunErrorMessage(createRunMutation.error) : undefined}
            selectedRuns={parentRunSelection.selectedRuns}
            selectedSubstrates={selectedSubstrates}
            partIdsByRunId={parentRunSelection.partIdsByRunId}
            onBack={() => setActivePage("parts")}
            onSubmit={(runValues) => {
              createRunMutation.mutate({
                runValues,
                parentRuns: parentRunSelection,
                substrates: selectedSubstrates,
              });
            }}
          />
        )}

        {activePage !== "details" && (
          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="primary"
              disabled={createRunMutation.isPending}
              onClick={() => {
                setActivePage("details");
              }}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
