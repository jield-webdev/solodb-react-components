import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function MonitorHeaderElement() {
  return (
    <Container fluid={true}>
      <Outlet />
    </Container>
  );
}
