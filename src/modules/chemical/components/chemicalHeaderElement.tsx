import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function ChemicalHeaderElement() {
  return (
    <Container fluid>
      <Outlet />
    </Container>
  );
}
