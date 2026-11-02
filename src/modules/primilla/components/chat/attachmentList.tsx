import { Attachment } from "../../interfaces/primilla";
import AttachmentItem from "./attachmentItem";

export default function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  return (
    <div className="d-flex flex-column gap-2 mt-2">
      {attachments.map((attachment) => (
        <AttachmentItem key={attachment.url} attachment={attachment} />
      ))}
    </div>
  );
}
