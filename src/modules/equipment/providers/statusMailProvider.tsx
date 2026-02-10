import React, { Suspense } from "react";
import { StatusMailContext } from "@jield/solodb-react-components/modules/equipment/contexts/statusMailContext";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getStatusMail } from "@jield/solodb-typescript-core";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import ErrorBoundary from "@jield/solodb-react-components/modules/core/components/common/ErrorBoundary";

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
      <ErrorBoundary>
        <LoadingComponent message="Loading status mail..." />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <StatusMailContext.Provider
        value={{
          statusMail: statusMailQuery.data!,
        }}
      >
        <Suspense fallback={<LoadingComponent message="Loading..." />}>{children}</Suspense>
      </StatusMailContext.Provider>
    </ErrorBoundary>
  );
}
