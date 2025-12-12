import { default as React } from 'react';
/**
 * Component that renders text with line breaks converted to <br /> elements
 * Safe alternative to react-nl2br without dangerouslySetInnerHTML
 */
export declare function TextWithLineBreaks({ text }: {
    text: string | null | undefined;
}): React.ReactElement | null;
