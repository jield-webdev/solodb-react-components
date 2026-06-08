import { createRunParent, type Run, type Substrate } from "@jield/solodb-typescript-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Nav } from "react-bootstrap";
import { useParams } from "react-router-dom";
import RunSelect from "./elements/runSelect";
import SubstrateSelect from "./elements/substrateSelect";

type WizardPage = "parts" | "substrate";

type ParentRunState = {
  selectedRun: Run | null;
  selectedPartIds: number[];
  description: string;
};

export default function NewRunWizard() {
  const { environment } = useParams();
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState<WizardPage>("parts");
  const [selectedSubstrate, setSelectedSubstrate] = useState<Substrate | null>(null);
  const [parentRunState, setParentRunState] = useState<ParentRunState>({
    selectedRun: null,
    selectedPartIds: [],
    description: "",
  });

  const createRunMutation = useMutation({
    mutationFn: ({
      parentRunId,
      partIds,
      description,
    }: {
      parentRunId: number;
      partIds: number[];
      description: string;
    }) => {
      return createRunParent({
        run_id: null,
        parent_run_id: parentRunId,
        part_ids: partIds,
        description: description || null,
      });
    },
    onSuccess: (_runParent, variables) => {
      queryClient.invalidateQueries({ queryKey: [environment] });
      queryClient.invalidateQueries({ queryKey: [variables.parentRunId] });
    },
  });

  return (
    <div>
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

      {activePage === "parts" && (
        <RunSelect
          selectedRun={parentRunState.selectedRun}
          setSelectedRun={(selectedRun) => setParentRunState((current) => ({ ...current, selectedRun }))}
          selectedPartIds={parentRunState.selectedPartIds}
          setSelectedPartIds={(selectedPartIds) => setParentRunState((current) => ({ ...current, selectedPartIds }))}
          description={parentRunState.description}
          setDescription={(description) => setParentRunState((current) => ({ ...current, description }))}
        />
      )}

      {activePage === "substrate" && (
        <SubstrateSelect selectedSubstrate={selectedSubstrate} setSelectedSubstrate={setSelectedSubstrate} />
      )}

      <div className="d-flex justify-content-end mt-4">
        <Button
          variant="primary"
          disabled={!parentRunState.selectedRun || createRunMutation.isPending}
          onClick={() => {
            if (parentRunState.selectedRun) {
              createRunMutation.mutate({
                parentRunId: parentRunState.selectedRun.id,
                partIds: parentRunState.selectedPartIds,
                description: parentRunState.description,
              });
            }
          }}
        >
          {createRunMutation.isPending ? "Creating..." : "Create Run"}
        </Button>
      </div>
    </div>
  );
}
