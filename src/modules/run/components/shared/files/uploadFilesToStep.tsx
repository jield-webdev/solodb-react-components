import { File } from "@/modules/core/interfaces/file";
import Config from "@/constants/config";
import { Badge, Button, ListGroup, Table } from "react-bootstrap";
import Moment from "react-moment";
import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ListRunStepFiles from "@/modules/run/api/step/listRunStepFiles";
import { RunStep } from "@/modules/run/interfaces/runStep";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function UploadFilesToStep({ runStep, refetchFn }: { runStep: RunStep; refetchFn?: () => void }) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["files", runStep.id],
    queryFn: () => ListRunStepFiles({ step: runStep }),
  });

  const queryClient = useQueryClient();

  const refetch = () => {
    queryClient.refetchQueries({ queryKey: ["files", runStep.id] });
    if (refetchFn) {
      refetchFn();
    }
  };

  const filesData = data?.items ?? [];

  const onClickDeleteFile = async (file: File) => {
    if (confirm(`Are you sure you want to delete ${file.name}? You can not undo this action`)) {
      try {
        await axios.delete(`delete/run/step/file/${file.id}`);
        refetch();
      } catch (error: any) {
        console.error(error);
      }
    }
  };

  const onDrop = (acceptedFiles: any) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    setUploadStatus(`${acceptedFiles.length} file(s) selected`);
  };

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({ onDrop });

  const style = useMemo(
    () => ({
      ...(isDragActive ? { borderColor: "#83afee" } : {}),
      ...(isDragAccept ? { borderColor: "#00e676" } : {}),
      ...(isDragReject ? { borderColor: "#ff1744" } : {}),
    }),
    [isDragAccept, isDragReject, isDragActive]
  );

  const handleUpload = () => {
    selectedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onload = async () => {
        const binaryStr = reader.result;

        try {
          await axios.create().post("update/run/step/upload-file/" + runStep.id, {
            content: binaryStr,
            filename: file.name,
            type: file.type,
          });
        } catch (error: any) {
          setUploadStatus("Upload failed due to: " + error.response.data.detail);
        }

        try {
          refetch();
          setUploadStatus("Files uploaded succesfully");
          setSelectedFiles([]);
        } catch (error: any) {
          setUploadStatus("Error refetching file data");
          console.error(error);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {filesData && filesData.length > 0 && (
        <Table hover striped>
          <thead>
            <tr>
              <th>No</th>
              <th>File</th>
              <th>Size</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filesData.map((file: File, i) => (
              <tr key={i}>
                <td>
                  <small className="text-muted">{i + 1}</small>
                </td>
                <td>
                  <a href={`${Config.SERVER_URI}${file.url}`}>{file.name}</a>
                  {file.has_run_step_loggings && <Badge className="ms-1 bg-primary">Logging</Badge>}
                </td>
                <td>
                  <i
                    className="fa fa-trash-o remove-file handle"
                    style={{ cursor: "pointer" }}
                    onClick={() => onClickDeleteFile(file)}
                  />
                  {" "}
                  {formatFileSize(file.size)}
                </td>
                <td>
                  <Moment format="DD-MM-YY HH:mm">{file.date_created}</Moment>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Dropzone area */}
      <div
        {...getRootProps({
          style,
          className: "dropzone bg-secondary-subtle border rounded dz-clickable",
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop files here...</p> : <p>Drag and drop files here or click to select</p>}
      </div>

      {/* List of selected files before upload */}
      {selectedFiles.length > 0 && (
        <ListGroup className="mt-3">
          {selectedFiles.map((file, idx) => (
            <ListGroup.Item key={idx}>{file.name}</ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Upload button */}
      <Button className="mt-3" onClick={handleUpload} disabled={selectedFiles.length === 0}>
        Upload Selected Files
      </Button>

      <p className="mt-2 text-muted">{uploadStatus}</p>
    </div>
  );
}