import React from 'react';

type ErrorBoundaryProps = {
    fallback?: React.ReactNode;
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
};

// React error boundaries must be class components
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // You can log the error to an error reporting service here
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return <>{this.props.fallback}</>;
            }

            return (
                <div style={{ padding: 16 }}>
                    <h3>Something went wrong.</h3>
                    {this.state.error && (
                        <pre style={{ color: '#c00', whiteSpace: 'pre-wrap' }}>
                            {this.state.error.message}
                        </pre>
                    )}
                    <button onClick={this.handleReset}>Try again</button>
                </div>
            );
        }

        return this.props.children as React.ReactElement;
    }
}

export default ErrorBoundary;
