import { Alert, Spinner } from "react-bootstrap";
import { Attachment } from "../../interfaces/primilla";
import { useAttachmentPreview } from "../../hooks/useAttachmentPreview";

// Primilla charts are centered 900x500px canvases; narrower frames clip their left side.
const REPORT_MIN_WIDTH = "960px";
const REPORT_HEIGHT = "600px";

export default function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const { data, isPending, error } = useAttachmentPreview(attachment);

  if (isPending) return <Spinner size="sm" />;
  if (error) return <Alert variant="warning">Preview unavailable: {error.message}</Alert>;

  return (
    <div className="overflow-auto rounded-2 mt-2 bg-white">
      <iframe
        className="d-block w-100 border-0"
        style={{ minWidth: REPORT_MIN_WIDTH, height: REPORT_HEIGHT }}
        title={attachment.filename}
        sandbox="allow-scripts"
        srcDoc={data}
      />
    </div>
  );
}
