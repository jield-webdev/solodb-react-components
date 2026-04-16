import { AuthProvider, NotificationProvider, ScannerProvider } from "@jield/solodb-react-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export const Providers = ({ child }: { child: ReactNode }) => {
  return (
    <AuthProvider>
      <ScannerProvider>
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>{child}</QueryClientProvider>
        </NotificationProvider>
      </ScannerProvider>
    </AuthProvider>
  );
};
