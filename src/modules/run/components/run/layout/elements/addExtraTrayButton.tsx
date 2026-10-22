import { useContext } from "react";
import { useIsMutating } from "@tanstack/react-query";
import { Alert, Button } from "react-bootstrap";
import { RunContext } from "../../../../contexts/runContext";
import useRunTrayMutation, { getRunTrayErrorMessage } from "../../../../hooks/useRunTrayMutation";

export default function AddExtraTrayButton() {
  const { run } = useContext(RunContext);
  const mutation = useRunTrayMutation(run.id);
  const isMutating = useIsMutating({ mutationKey: ["runTray", run.id] }) > 0;

  if (!run.tray_type || !run.run_trays?.some((tray) => !tray.extra_tray_id)) return null;

  return (
    <div>
      <Button size="sm" disabled={isMutating} onClick={() => mutation.mutate({ action: "create" })}>
        {mutation.isPending ? "Adding tray…" : "Add extra tray"}
      </Button>
      {mutation.isError && (
        <Alert variant="danger" className="mt-2 mb-0">
          {getRunTrayErrorMessage(mutation.error)}
        </Alert>
      )}
    </div>
  );
}
