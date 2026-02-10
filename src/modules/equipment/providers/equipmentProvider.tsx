import React, { Suspense } from "react";
import { useEquipment } from "@jield/solodb-react-components/modules/equipment/hooks/useEquipment";
import { EquipmentContext } from "@jield/solodb-react-components/modules/equipment/contexts/equipmentContext";
import LoadingComponent from "@jield/solodb-react-components/modules/core/components/common/LoadingComponent";
import ErrorBoundary from "@jield/solodb-react-components/modules/core/components/common/ErrorBoundary";

export default function EquipmentProvider({ children }: { children: React.ReactNode }) {
  const { equipment, reloadEquipment } = useEquipment();

  if (null === equipment) {
    return (
      <ErrorBoundary>
        <LoadingComponent message="Loading equipment..." />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <EquipmentContext.Provider
        value={{
          equipment,
          reloadEquipment,
        }}
      >
        <Suspense fallback={<LoadingComponent message="Loading..." />}>{children}</Suspense>
      </EquipmentContext.Provider>
    </ErrorBoundary>
  );
}
