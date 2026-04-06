import { default as React } from 'react';
type ErrorBoundaryProps = {
    fallback?: React.ReactNode;
    children: React.ReactNode;
};
type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
};
declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    handleReset: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default ErrorBoundary;
