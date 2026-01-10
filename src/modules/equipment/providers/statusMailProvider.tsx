import React from "react";
import { StatusMailContext } from "@jield/solodb-react-components/modules/equipment/contexts/statusMailContext";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getStatusMail } from "@jield/solodb-typescript-core";

export default function StatusMailProvider({ children }: { children: React.ReactNode }) {
  const { id } = useParams();

  //Use a query to fetch the statusMail
  const statusMailQuery = useQuery({
    queryKey: ["statusMail", id],
    queryFn: () => getStatusMail({ id: parseInt(id!) }),
    enabled: !!id,
  });

  if (statusMailQuery.isLoading || statusMailQuery.isFetching) {
    return (
      <div className={"d-flex justify-content-center h-100 vh-100 flex-row align-items-center"}>
        <div className={"d-flex flex-column align-items-center"}>
          <h1>Loading statusMail</h1>
          <div className="spinner-border" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading status Mail</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StatusMailContext.Provider
      value={{
        statusMail: statusMailQuery.data!,
      }}
    >
      {children}
    </StatusMailContext.Provider>
  );
}
