import { useId } from "react";

const KESTREL_PATH =
  "M16 5C17.4 5 18 6.2 18 7.4C18.1 8.4 18.2 9.2 18.2 10C20.5 9.6 23 9.2 25 9.6C27.5 10.6 29.5 13 31 15.5C27.5 14 23 13.4 18.4 14.6C18.3 16.4 17.9 17.8 17.4 19L18.6 27C17 27.8 15 27.8 13.4 27L14.6 19C14.1 17.8 13.7 16.4 13.6 14.6C9 13.4 4.5 14 1 15.5C2.5 13 4.5 10.6 7 9.6C9 9.2 11.5 9.6 13.8 10C13.8 9.2 13.9 8.4 14 7.4C14 6.2 14.6 5 16 5Z";

export default function PrimillaIcon({ size = 24 }: { size?: number }) {
  const maskId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <mask id={maskId}>
        <rect width="32" height="32" fill="white" />
        <path d="M13.7 24.6Q16 25.2 18.3 24.6" fill="none" stroke="black" strokeWidth="0.8" />
      </mask>
      <path d={KESTREL_PATH} mask={`url(#${maskId})`} />
    </svg>
  );
}
