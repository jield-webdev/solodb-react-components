import React from "react";
import Pagination from "react-bootstrap/Pagination";
import { ApiFormattedResponse } from "@/modules/core/interfaces/response";
import { Button, Form } from "react-bootstrap";

const PaginationLinks = ({
  data,
  setPage,
  setPageSize,
  pageSize,
  isPlaceholderData,
}: {
  data: ApiFormattedResponse<any> | undefined;
  setPage: (page: (old: number) => number) => void;
  setPageSize?: (pageSize: (old: number) => number) => void;
  pageSize?: number;
  isPlaceholderData: boolean;
}) => {
  if (data === undefined || isPlaceholderData) {
    return <></>;
  }

  let items = [];
  for (let number = 1; number <= data.amountOfPages; number++) {
    items.push(
      <Pagination.Item key={number} active={number === data.currentPage} onClick={() => setPage((old) => number)}>
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div className={"d-flex justify-content-between"}>
      <div className={"d-flex gap-2"}>
        <div>
          <Button size={"sm"} onClick={() => setPage((old) => Math.max(old - 1, 0))} disabled={data.currentPage === 1}>
            Previous Page
          </Button>
        </div>
        <Pagination size="sm">
          {items.map((item, key) => (
            <div key={key}>{item}</div>
          ))}
        </Pagination>
        <div>
          <Button
            size={"sm"}
            onClick={() => {
              if (!isPlaceholderData && data.hasMore) {
                setPage((old) => old + 1);
              }
            }}
            // Disable the Next Page button until we know a next page is available
            disabled={isPlaceholderData || !data.hasMore}
          >
            Next Page
          </Button>
        </div>
      </div>
      {setPageSize !== undefined ? (
        <div>
          <Form.Select
            onChange={(event) => {
              setPageSize((old) => parseInt(event.target.value));
            }}
            value={pageSize}
            size={"sm"}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
        </div>
      ) : null}
    </div>
  );
};

export default PaginationLinks;
