import React, { useContext, useMemo, useState } from "react";
import { Badge, Button, ListGroup, Placeholder, Table } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import { formatDateTime } from "@jield/solodb-react-components/utils/datetime";
import { listRunFile, uploadRunFile, deleteRunFile, File as RunFile } from "@jield/solodb-typescript-core";
import { Link, useParams } from "react-router-dom";
import { getSolodbServerCleanUrl } from "@jield/solodb-react-components/modules/core/config/runtimeConfig";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function RunUploadFiles() {
  const { run } = useContext(RunContext);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const { environment } = useParams();

  const { data, isLoading: isLoadingFiles } = useQuery({
    queryKey: ["run-files", run.id],
    queryFn: () => listRunFile({ run }),
    enabled: !!run?.id,
  });

  const filesData = data?.items ?? [];

  const refetch = () => {
    queryClient.refetchQueries({ queryKey: ["run-files", run.id] });
  };

  const onDrop = (acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    setUploadStatus(`${acceptedFiles.length} file(s) selected`);
  };

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({ onDrop });

  const dropzoneStyle = useMemo(
    () => ({
      ...(isDragActive ? { borderColor: "#83afee" } : {}),
      ...(isDragAccept ? { borderColor: "#00e676" } : {}),
      ...(isDragReject ? { borderColor: "#ff1744" } : {}),
    }),
    [isDragAccept, isDragReject, isDragActive]
  );

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadStatus("Uploading...");

    let completed = 0;
    const total = selectedFiles.length;
    let failed = 0;

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const binaryStr = reader.result as string;
        try {
          await uploadRunFile({
            filename: file.name,
            type: file.type,
            content: binaryStr,
            run,
          });
        } catch (error: any) {
          failed += 1;
          console.error(error);
        } finally {
          completed += 1;
          if (completed === total) {
            setIsUploading(false);
            setSelectedFiles([]);
            if (failed === 0) {
              setUploadStatus("Files uploaded successfully");
            } else {
              setUploadStatus(`Upload finished with ${failed} error(s)`);
            }
            refetch();
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const onClickDeleteFile = async (file: RunFile) => {
    if (confirm(`Are you sure you want to delete ${file.name}? You can not undo this action`)) {
      try {
        await deleteRunFile({ file });
        refetch();
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  return (
    <div className="mt-5">
      <h3 className="h5 mb-3">
        <i className="fa fa-paperclip text-secondary me-2" aria-hidden="true" />
        Files
      </h3>

      {isLoadingFiles ? (
        <Table hover striped responsive className="align-middle">
          <thead>
            <tr>
              <th style={{ width: "3rem" }}>No</th>
              <th>File</th>
              <th>Size</th>
              <th>Date</th>
              <th style={{ width: "8rem" }} className="text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={6} />
                </Placeholder>
              </td>
              <td>
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={8} />
                </Placeholder>
              </td>
              <td>
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={4} />
                </Placeholder>
              </td>
              <td>
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={6} />
                </Placeholder>
              </td>
              <td className="text-end">
                <Placeholder as="span" animation="glow">
                  <Placeholder xs={10} />
                </Placeholder>
              </td>
            </tr>
          </tbody>
        </Table>
      ) : filesData.length > 0 ? (
        <Table hover striped responsive className="align-middle">
          <thead>
            <tr>
              <th style={{ width: "3rem" }}>No</th>
              <th>File</th>
              <th>Size</th>
              <th>Date</th>
              <th style={{ width: "8rem" }} className="text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filesData.map((file: RunFile, i) => (
              <tr key={file.id}>
                <td>
                  <small className="text-muted">{i + 1}</small>
                </td>
                <td>
                  <Link to={`${getSolodbServerCleanUrl()}/${environment}/file/download/${file.id}`}>{file.name}</Link>
                  {file.has_run_step_loggings && <Badge className="ms-2 bg-primary">Logging</Badge>}
                </td>
                <td>{formatFileSize(file.size)}</td>
                <td>{formatDateTime(file.date_created, "DD-MM-YY HH:mm")}</td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => {
                      window.location.href = `${getSolodbServerCleanUrl()}/${environment}/file/download/${file.id}`;
                    }}
                    aria-label={`Download ${file.name}`}
                    title="Download"
                  >
                    <i className="fa fa-download" aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onClickDeleteFile(file)}
                    aria-label={`Delete ${file.name}`}
                    title="Delete"
                  >
                    <i className="fa fa-trash-o" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="text-muted fst-italic mb-3">No files uploaded yet</div>
      )}

      <div
        {...getRootProps({
          style: dropzoneStyle,
          className: "dropzone bg-secondary-subtle border rounded dz-clickable",
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop files here...</p> : <p>Drag and drop files here or click to select</p>}
      </div>

      {selectedFiles.length > 0 && (
        <ListGroup className="mt-3">
          {selectedFiles.map((file, idx) => (
            <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
              <span>{file.name}</span>
              <small className="text-muted">{formatFileSize(file.size)}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <div className="text-start">
        <Button className="mt-3" onClick={handleUpload} disabled={selectedFiles.length === 0 || isUploading}>
          {isUploading ? "Uploading..." : "Upload Selected Files"}
        </Button>
        {uploadStatus && <p className="mt-2 text-muted small">{uploadStatus}</p>}
      </div>
    </div>
  );
}
