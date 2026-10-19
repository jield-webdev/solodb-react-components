import { Button, Spinner } from "react-bootstrap";
import { Attachment } from "../../interfaces/primilla";
import { useDownloadAttachment } from "../../hooks/useDownloadAttachment";
import { formatFileSize, isHtmlAttachment } from "../../utils/attachmentFiles";
import AttachmentPreview from "./attachmentPreview";

export default function AttachmentItem({ attachment }: { attachment: Attachment }) {
  const { mutate: download, isPending } = useDownloadAttachment();

  return (
    <div className="bg-body text-body border rounded-2 p-2">
      <div className="d-flex align-items-center gap-2">
        <span className="flex-grow-1 fw-semibold" style={{ minWidth: 0, overflowWrap: "anywhere" }}>
          {attachment.filename}
        </span>
        <small className="text-body-secondary">{formatFileSize(attachment.size)}</small>
        <Button size="sm" variant="outline-primary" disabled={isPending} onClick={() => download(attachment)}>
          {isPending ? <Spinner size="sm" /> : "Download"}
        </Button>
      </div>
      {isHtmlAttachment(attachment) && <AttachmentPreview attachment={attachment} />}
    </div>
  );
}
