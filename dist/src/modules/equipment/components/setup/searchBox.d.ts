import { default as React } from 'react';
export default function SharchBox({ setSearchQuery, resetFilter }: {
    setSearchQuery: (query: string) => void;
    resetFilter: () => void;
}): React.JSX.Element;
