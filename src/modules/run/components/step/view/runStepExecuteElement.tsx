import React from "react";

import StepDashboard from "@jield/solodb-react-components/modules/run/components/step/view/element/stepDashboard";
import InputModal from "@jield/solodb-react-components/modules/partial/modal";
import { ScannerProvider } from "@jield/solodb-react-components/modules/core/contexts/scanner/ScannerProvider";
import { NotificationProvider } from "@jield/solodb-react-components/utils/notification";

export default function RunStepExecuteElement() {
  return (
    <NotificationProvider>
      <ScannerProvider>
        <>
          <StepDashboard />
          <InputModal />
        </>
      </ScannerProvider>
    </NotificationProvider>
  );
}
