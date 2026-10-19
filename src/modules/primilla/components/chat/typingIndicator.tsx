import { Spinner } from "react-bootstrap";

export default function TypingIndicator() {
  return (
    <span className="d-inline-flex gap-1 align-items-center" role="status" aria-label="Primilla is typing">
      {[0, 150, 300].map((delay) => (
        <Spinner
          key={delay}
          animation="grow"
          size="sm"
          style={{ width: "0.5rem", height: "0.5rem", animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
