/**
 * Text formatting utilities
 * Replaces react-nl2br with safe React rendering
 */

import React from 'react';

/**
 * Component that renders text with line breaks converted to <br /> elements
 * Safe alternative to react-nl2br without dangerouslySetInnerHTML
 */
export function TextWithLineBreaks({ text }: { text: string | null | undefined }): React.ReactElement | null {
  if (!text) return null;

  const lines = text.split(/\r\n|\n|\r/);

  return (
    <>
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}
