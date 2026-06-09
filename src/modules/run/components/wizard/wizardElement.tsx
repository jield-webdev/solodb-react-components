import { createRun, createRunParent, createRunSubstrate, type Run } from "@jield/solodb-typescript-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Button, Nav } from "react-bootstrap";
import { useParams } from "react-router-dom";
import CreateRunForm, { type CreateRunFormValues } from "./crateRun";
import RunSelect from "./runSelect";
import SubstrateSelect, { type SelectedSubstrate } from "./substrateSelect";

type WizardPage = "parts" | "substrate" | "details";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message !== "") {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response: { data?: { message?: unknown; detail?: unknown } } }).response;

    if (typeof response.data?.message === "string") {
      return response.data.message;
    }

    if (typeof response.data?.detail === "string") {
      return response.data.detail;
    }
  }

  return "Could not create the run.";
};

export default function NewRunWizard() {
  const { environment } = useParams();
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState<WizardPage>("parts");
  const [selectedSubstrates, setSelectedSubstrates] = useState<SelectedSubstrate[]>([]);
  const [selectedRuns, setSelectedRuns] = useState<Run[]>([]);
  const [selectedPartIdsByRunId, setSelectedPartIdsByRunId] = useState<Record<number, number[]>>({});
  const [amountPerPartByRunId, setAmountPerPartByRunId] = useState<Record<number, Record<number, number>>>({});
  const [descriptionsByRunId, setDescriptionsByRunId] = useState<Record<number, string>>({});

  const createRunMutation = useMutation({
    mutationFn: async ({
      runValues,
      parentRuns,
      partIdsByRunId,
      amountPerPartByRunId,
      descriptionsByRunId,
      substrates,
    }: {
      runValues: CreateRunFormValues;
      parentRuns: Run[];
      partIdsByRunId: Record<number, number[]>;
      amountPerPartByRunId: Record<number, Record<number, number>>;
      descriptionsByRunId: Record<number, string>;
      substrates: SelectedSubstrate[];
    }): Promise<Run> => {
      const createdRun = await createRun({
        name: runValues.name,
        motivation: runValues.motivation,
        group_id: runValues.groupId,
        team_id: runValues.teamId,
        project_id: runValues.projectId,
        experimental_split: runValues.parts,
        location: runValues.location || null,
        conclusion: runValues.conclusion || null,
        run_type: runValues.runType,
      });

      const parentPromises = parentRuns.map((parentRun) => {
        const partIds = partIdsByRunId[parentRun.id] ?? [];
        const amountByPartId = amountPerPartByRunId[parentRun.id] ?? {};
        const amountPerPart =
          partIds.length > 0
            ? Object.fromEntries(partIds.map((partId) => [partId, amountByPartId[partId] ?? 1]))
            : null;

        return createRunParent({
          run_id: createdRun.id,
          parent_run_id: parentRun.id,
          part_ids: partIds,
          amount_per_part: amountPerPart,
          description: descriptionsByRunId[parentRun.id] || null,
        });
      });

      const substratePromises = substrates.map(({ substrate, amount }) =>
        createRunSubstrate({
          run_id: createdRun.id,
          substrate_id: substrate.id,
          amount,
        })
      );

      await Promise.all([Promise.all(parentPromises), Promise.all(substratePromises)]);

      return createdRun;
    },
    onSuccess: (run, variables) => {
      queryClient.invalidateQueries({ queryKey: [environment] });
      queryClient.invalidateQueries({ queryKey: [run.id] });
      variables.parentRuns.forEach((parentRun) => {
        queryClient.invalidateQueries({ queryKey: [parentRun.id] });
      });
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
        {activePage === "parts" && (
          <RunSelect
            selectedRuns={selectedRuns}
            setSelectedRuns={setSelectedRuns}
            selectedPartIdsByRunId={selectedPartIdsByRunId}
            setSelectedPartIdsByRunId={setSelectedPartIdsByRunId}
            amountPerPartByRunId={amountPerPartByRunId}
            setAmountPerPartByRunId={setAmountPerPartByRunId}
            descriptionsByRunId={descriptionsByRunId}
            setDescriptionsByRunId={setDescriptionsByRunId}
          />
        )}

        {activePage === "substrate" && (
          <SubstrateSelect selectedSubstrates={selectedSubstrates} setSelectedSubstrates={setSelectedSubstrates} />
        )}

        {activePage === "details" && (
          <CreateRunForm
            isSubmitting={createRunMutation.isPending}
            errorMessage={createRunMutation.isError ? getErrorMessage(createRunMutation.error) : undefined}
            selectedRuns={selectedRuns}
            selectedSubstrates={selectedSubstrates}
            selectedPartIdsByRunId={selectedPartIdsByRunId}
            onBack={() => setActivePage("parts")}
            onSubmit={(runValues) => {
              createRunMutation.mutate({
                runValues,
                parentRuns: selectedRuns,
                partIdsByRunId: selectedPartIdsByRunId,
                amountPerPartByRunId,
                descriptionsByRunId,
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

        {createRunMutation.isSuccess && (
          <Alert variant="success" className="mt-3">
            Run Created:{" "}
            <Alert.Link href={`${environment}/run/${createRunMutation.data.id}/information.html`}>
              #{createRunMutation.data.id}
            </Alert.Link>
          </Alert>
        )}
      </div>
    </div>
  );
}
