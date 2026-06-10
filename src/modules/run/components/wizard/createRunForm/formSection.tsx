import { type ReactNode } from "react";
import { Col, Row } from "react-bootstrap";

// A labelled section: the title sits on the left, the controls are padded to the
// right, and a divider separates it from the previous section.
export default function FormSection({
  title,
  isFirst = false,
  children,
}: {
  title: string;
  isFirst?: boolean;
  children: ReactNode;
}) {
  return (
    <Row className={`g-3 py-4${isFirst ? "" : " border-top"}`}>
      <Col xs={12} md={3}>
        <h3 className="fs-5 mb-0">{title}</h3>
      </Col>
      <Col xs={12} md={9}>
        <div className="d-flex flex-column gap-3">{children}</div>
      </Col>
    </Row>
  );
}
