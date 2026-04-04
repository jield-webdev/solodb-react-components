import { default as React, ReactNode } from 'react';
interface Props {
    goldsteinFQDN: string;
    associationType: string;
    associationID: number;
}
interface GoldsteinDataContextValue {
    goldsteinData: Props;
    setGoldsteinData: React.Dispatch<React.SetStateAction<Props>>;
}
export declare const GoldsteinDataContext: React.Context<GoldsteinDataContextValue | undefined>;
interface GoldsteinDataProviderProps {
    children: ReactNode;
    defaultData: Props;
}
export declare function GoldsteinDataProvider({ children, defaultData }: GoldsteinDataProviderProps): import("react/jsx-runtime").JSX.Element;
export declare const useGoldsteinClientDataContext: () => GoldsteinDataContextValue;
export {};
