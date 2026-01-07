import React from "react";

import { createContext, ReactNode, useState, useContext } from "react";

interface Props {
  goldsteinFQDN: string;
  associationType: string;
  associationID: number;
}

interface GoldsteinDataContextValue {
  goldsteinData: Props;
  setGoldsteinData: React.Dispatch<React.SetStateAction<Props>>;
}

export const GoldsteinDataContext = createContext<GoldsteinDataContextValue | undefined>(undefined);

interface GoldsteinDataProviderProps {
  children: ReactNode;
  defaultData: Props;
}

export function GoldsteinDataProvider({ children, defaultData }: GoldsteinDataProviderProps) {
  const [goldsteinData, setGoldsteinData] = useState<Props>(defaultData);

  return (
    <GoldsteinDataContext.Provider value={{ goldsteinData, setGoldsteinData }}>
      {children}
    </GoldsteinDataContext.Provider>
  );
}

export const useGoldsteinClientDataContext = () => {
  const context = useContext(GoldsteinDataContext);
  if (context === undefined) {
    throw new Error('useAssociationContext must be used within an AssociationProvider');
  }
  return context;
};
