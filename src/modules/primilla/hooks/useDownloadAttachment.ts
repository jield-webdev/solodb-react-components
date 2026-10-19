import { useMutation } from "@tanstack/react-query";
import { notification } from "@jield/solodb-react-components/utils/notification";
import { Attachment } from "../interfaces/primilla";
import { fetchAttachmentBlob, saveBlob } from "../utils/attachmentFiles";

export const useDownloadAttachment = () =>
  useMutation<void, Error, Attachment>({
    mutationFn: async ({ url, filename }) => saveBlob(await fetchAttachmentBlob(url), filename),
    onError: (error) =>
      notification({
        notificationHeader: "Downloading report failed",
        notificationBody: error.message,
        notificationType: "danger",
      }),
  });
