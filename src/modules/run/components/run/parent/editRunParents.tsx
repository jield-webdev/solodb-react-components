import { createRunParent, type Run, type RunParent } from "@jield/solodb-typescript-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import RunSelect from "../../wizard/runSelect";

export default function EditRunParents() {
  const { environment } = useParams();
  const { run, reloadRun } = useContext(RunContext);
  const queryClient = useQueryClient();
  const [selectedRuns, setSelectedRuns] = useState<Run[]>([]);
  const [selectedPartIdsByRunId, setSelectedPartIdsByRunId] = useState<Record<number, number[]>>({});
  const [amountPerPartByRunId, setAmountPerPartByRunId] = useState<Record<number, Record<number, number>>>({});
  const [descriptionsByRunId, setDescriptionsByRunId] = useState<Record<number, string>>({});

  const addRunParentsMutation = useMutation({
    mutationFn: async ({
      parentRuns,
      partIdsByRunId,
      amountPerPartByRunId,
      descriptionsByRunId,
    }: {
      parentRuns: Run[];
      partIdsByRunId: Record<number, number[]>;
      amountPerPartByRunId: Record<number, Record<number, number>>;
      descriptionsByRunId: Record<number, string>;
    }): Promise<RunParent[]> => {
      const runParents: RunParent[] = [];

      for (const parentRun of parentRuns) {
        const partIds = partIdsByRunId[parentRun.id] ?? [];
        const amountByPartId = amountPerPartByRunId[parentRun.id] ?? {};
        const amountPerPart =
          partIds.length > 0
            ? Object.fromEntries(partIds.map((partId) => [partId, amountByPartId[partId] ?? 1]))
            : null;

        const runParent = await createRunParent({
          run_id: run.id,
          parent_run_id: parentRun.id,
          part_ids: partIds,
          amount_per_part: amountPerPart,
          description: descriptionsByRunId[parentRun.id] || null,
        });

        runParents.push(runParent);
      }

      return runParents;
    },
    onSuccess: (_runParent, variables) => {
      reloadRun();
      queryClient.invalidateQueries({ queryKey: [environment] });
      queryClient.invalidateQueries({ queryKey: [run.id] });
      variables.parentRuns.forEach((parentRun) => {
        queryClient.invalidateQueries({ queryKey: [parentRun.id] });
      });
    },
  });

  return (
    <div>
      <div>
        <RunSelect
          selectedRuns={selectedRuns}
          setSelectedRuns={setSelectedRuns}
          selectedPartIdsByRunId={selectedPartIdsByRunId}
          setSelectedPartIdsByRunId={setSelectedPartIdsByRunId}
          amountPerPartByRunId={amountPerPartByRunId}
          setAmountPerPartByRunId={setAmountPerPartByRunId}
          descriptionsByRunId={descriptionsByRunId}
          setDescriptionsByRunId={setDescriptionsByRunId}
          run={run}
        />

        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="primary"
            disabled={selectedRuns.length === 0 || addRunParentsMutation.isPending}
            onClick={() => {
              if (selectedRuns.length > 0) {
                addRunParentsMutation.mutate({
                  parentRuns: selectedRuns,
                  partIdsByRunId: selectedPartIdsByRunId,
                  amountPerPartByRunId,
                  descriptionsByRunId,
                });
              }
            }}
          >
            {addRunParentsMutation.isPending ? "Adding..." : "Add Parent Runs"}
          </Button>
        </div>

        {addRunParentsMutation.isSuccess && addRunParentsMutation.data.length > 0 && (
          <Alert variant="success" className="mt-3">
            Parent runs added to {run.label ?? `#${run.id}`}.
          </Alert>
        )}
      </div>
    </div>
  );
}
