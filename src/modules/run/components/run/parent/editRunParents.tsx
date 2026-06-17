import { createRunParent, type RunParent } from "@jield/solodb-typescript-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { Alert, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import { type ParentRunSelectionState, useParentRunSelection } from "../../../hooks/useParentRunSelection";
import { buildRunParentPayloads } from "../../../utils/buildRunParentPayloads";
import ParentRunSelect from "../../shared/parentRuns/parentRunSelect";

export default function EditRunParents() {
  const { environment } = useParams();
  const { run, reloadRun } = useContext(RunContext);
  const queryClient = useQueryClient();
  const selection = useParentRunSelection();

  const addRunParentsMutation = useMutation({
    mutationFn: async (parentRuns: ParentRunSelectionState): Promise<RunParent[]> => {
      return Promise.all(buildRunParentPayloads(run.id, parentRuns).map((payload) => createRunParent(payload)));
    },
    onSuccess: (_runParents, parentRuns) => {
      reloadRun();
      queryClient.invalidateQueries({ queryKey: [environment] });
      queryClient.invalidateQueries({ queryKey: [run.id] });
      parentRuns.selectedRuns.forEach((parentRun) => {
        queryClient.invalidateQueries({ queryKey: [parentRun.id] });
      });
    },
  });

  return (
    <div>
      <div>
        <ParentRunSelect selection={selection} run={run} />

        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="primary"
            disabled={selection.selectedRuns.length === 0 || addRunParentsMutation.isPending}
            onClick={() => {
              if (selection.selectedRuns.length > 0) {
                addRunParentsMutation.mutate(selection);
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
