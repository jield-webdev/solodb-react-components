import { useQuery } from "@tanstack/react-query";
import { Attachment } from "../interfaces/primilla";
import { fetchAttachmentText, isHtmlAttachment } from "../utils/attachmentFiles";

export const useAttachmentPreview = (attachment: Attachment) =>
  useQuery({
    queryKey: ["primilla", "attachment", attachment.url],
    queryFn: () => fetchAttachmentText(attachment.url),
    enabled: isHtmlAttachment(attachment),
    staleTime: Infinity,
    retry: false,
  });
