import React, { ReactNode, Suspense } from "react";
import { AuthContext } from "@jield/solodb-react-components/modules/core/contexts/authContext";
import { useAuth } from "@jield/solodb-react-components/modules/core/hooks/useAuth";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import ErrorBoundary from "@jield/solodb-react-components/modules/core/components/common/ErrorBoundary";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <ErrorBoundary>
        <LoadingComponent message="Loading user..." />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, setUser, isLoadingUser }}>
        <Suspense fallback={<LoadingComponent message="Loading..." />}>{children}</Suspense>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};
