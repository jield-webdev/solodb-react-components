import { QueryClient } from "@tanstack/react-query";
import { Run } from "@jield/solodb-typescript-core";
import { getExtraTrayId, type RunTray } from "@jield/solodb-react-components/modules/run/utils/runTrays";

export const getRunQueryKey = (runId: number) => ["run", runId] as const;

export const upsertRunTrayCache = (queryClient: QueryClient, runId: number, tray: RunTray): void => {
  queryClient.setQueryData<Run>(getRunQueryKey(runId), (run) => {
    if (!run) return run;

    const existingTrays = run.run_trays ?? [];
    const trayIndex = existingTrays.findIndex(
      (candidate) =>
        candidate.id === tray.id || (tray.extra_tray_id > 0 && getExtraTrayId(candidate) === tray.extra_tray_id)
    );
    const runTrays =
      trayIndex === -1
        ? [...existingTrays, tray]
        : existingTrays.map((candidate, index) => (index === trayIndex ? tray : candidate));

    return { ...run, run_trays: runTrays };
  });
};
