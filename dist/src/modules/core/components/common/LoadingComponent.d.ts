import { default as React } from 'react';
interface LoadingComponentProps {
    message?: string;
}
/**
 * A reusable loading component that displays a spinner and optional message
 * @param message - Optional custom message to display (defaults to translated "Loading...")
 */
declare const LoadingComponent: React.FC<LoadingComponentProps>;
export default LoadingComponent;
