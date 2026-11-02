import { useEffect, useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch {
      // Clipboard access can be denied; the reply text stays selectable.
    }
  };

  return (
    <button
      type="button"
      className="btn btn-sm btn-link text-body-secondary p-1 lh-1"
      aria-label={isCopied ? "Copied" : "Copy reply"}
      title={isCopied ? "Copied" : "Copy"}
      onClick={copy}
    >
      <i className={`fa ${isCopied ? "fa-check" : "fa-copy"}`} aria-hidden="true" />
    </button>
  );
}
