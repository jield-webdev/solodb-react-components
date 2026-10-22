import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeRunTrayCache, upsertRunTrayCache } from "../utils/runCache";
import type { RunTray } from "../utils/runTrays";

type TrayAction =
  { action: "create" } | { action: "rename"; trayId: number; name: string } | { action: "delete"; trayId: number };

export default function useRunTrayMutation(runId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["runTray", runId],
    mutationFn: async (action: TrayAction): Promise<RunTray | null> => {
      const client = axios.create();
      if (action.action === "create") {
        return (await client.post<RunTray>("create/run/tray", { run_id: runId })).data;
      }
      if (action.action === "rename") {
        return (await client.patch<RunTray>(`update/run/tray/${action.trayId}`, { name: action.name })).data;
      }
      await client.delete(`delete/run/tray/${action.trayId}`);
      return null;
    },
    onSuccess: (tray, action) => {
      if (tray) upsertRunTrayCache(queryClient, runId, tray);
      else if (action.action === "delete") removeRunTrayCache(queryClient, runId, action.trayId);
    },
  });
}

export const getRunTrayErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ detail?: string }>(error) && typeof error.response?.data?.detail === "string") {
    return error.response.data.detail;
  }
  return "Unable to update the extra tray. Please try again.";
};
