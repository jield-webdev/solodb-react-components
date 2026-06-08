import { createRunParent, type Run, type RunParent, type Substrate } from "@jield/solodb-typescript-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Nav } from "react-bootstrap";
import { useParams } from "react-router-dom";
import RunSelect from "./elements/runSelect";
import SubstrateSelect from "./elements/substrateSelect";

type WizardPage = "parts" | "substrate";

export default function NewRunWizard() {
  const { environment } = useParams();
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState<WizardPage>("parts");
  const [selectedSubstrate, setSelectedSubstrate] = useState<Substrate | null>(null);
  const [selectedRuns, setSelectedRuns] = useState<Run[]>([]);
  const [selectedPartIdsByRunId, setSelectedPartIdsByRunId] = useState<Record<number, number[]>>({});
  const [descriptionsByRunId, setDescriptionsByRunId] = useState<Record<number, string>>({});

  const createRunMutation = useMutation({
    mutationFn: async ({
      parentRuns,
      partIdsByRunId,
      descriptionsByRunId,
    }: {
      parentRuns: Run[];
      partIdsByRunId: Record<number, number[]>;
      descriptionsByRunId: Record<number, string>;
    }): Promise<RunParent[]> => {
      let createdRunId: number | null = null;
      const runParents: RunParent[] = [];

      for (const parentRun of parentRuns) {
        const runParent = await createRunParent({
          run_id: createdRunId,
          parent_run_id: parentRun.id,
          part_ids: partIdsByRunId[parentRun.id] ?? [],
          description: descriptionsByRunId[parentRun.id] || null,
        });

        createdRunId = runParent.run_id;
        runParents.push(runParent);
      }

      return runParents;
    },
    onSuccess: (_runParent, variables) => {
      queryClient.invalidateQueries({ queryKey: [environment] });
      variables.parentRuns.forEach((parentRun) => {
        queryClient.invalidateQueries({ queryKey: [parentRun.id] });
      });
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

      <div className="m-3">
        {activePage === "parts" && (
          <RunSelect
            selectedRuns={selectedRuns}
            setSelectedRuns={setSelectedRuns}
            selectedPartIdsByRunId={selectedPartIdsByRunId}
            setSelectedPartIdsByRunId={setSelectedPartIdsByRunId}
            descriptionsByRunId={descriptionsByRunId}
            setDescriptionsByRunId={setDescriptionsByRunId}
          />
        )}

        {activePage === "substrate" && (
          <SubstrateSelect selectedSubstrate={selectedSubstrate} setSelectedSubstrate={setSelectedSubstrate} />
        )}

        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="primary"
            disabled={selectedRuns.length === 0 || createRunMutation.isPending}
            onClick={() => {
              if (selectedRuns.length > 0) {
                createRunMutation.mutate({
                  parentRuns: selectedRuns,
                  partIdsByRunId: selectedPartIdsByRunId,
                  descriptionsByRunId,
                });
              }
            }}
          >
            {createRunMutation.isPending ? "Creating..." : "Create Run"}
          </Button>
        </div>
      </div>
    </div>
  );
}
