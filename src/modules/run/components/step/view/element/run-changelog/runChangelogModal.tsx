import React, { useContext, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import DateFormat from "@/modules/partial/dateFormat";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import PaginationLinks from "@/modules/partial/paginationLinks";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";
import { listRunChangelog, Changelog } from "solodb-typescript-core";

const RunChangelogModal = ({
  show,
  setModalShow,
}: {
  show: boolean;
  setModalShow: (setModalShow: boolean) => void;
}) => {
  const { run } = useContext(RunStepContext);
  const [page, setPage] = useState<number>(1);

  const { isPending, isLoading, isError, error, data, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["run_changelog", run, page],
    queryFn: () => listRunChangelog({ run: run, page: page }),
    placeholderData: keepPreviousData,
  });

  return (
    <Modal show={show} size={"lg"} onHide={() => setModalShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>History of Run {run.label}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          {isPending ? (
            <div>Loading...</div>
          ) : isError ? (
            <div>Error: {error.message}</div>
          ) : (
            <Table size="sm" striped bordered hover>
              <tbody>
                {data.items.map((changelog: Changelog, index: number) => (
                  <tr key={index}>
                    <td>
                      <DateFormat format="DD-MM-YYYY">{changelog.date_created}</DateFormat>
                    </td>
                    <td>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: changelog.message,
                        }}
                      />
                    </td>
                    <td>
                      {changelog.user.first_name} {changelog.user.last_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <PaginationLinks data={data} setPage={setPage} isPlaceholderData={isPlaceholderData} />

          {isFetching ? <span> Loading...</span> : null}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={"float-end"}
          variant="secondary"
          onClick={() => {
            setModalShow(false); //Close the modal
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RunChangelogModal;
