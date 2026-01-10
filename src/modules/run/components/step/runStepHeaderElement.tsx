import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import RunStepProvider from "@jield/solodb-react-components/modules/run/providers/runStepProvider";

export default function RunStepHeaderElement() {
  return (
    <RunStepProvider>
      <Container fluid>
        <Outlet />
      </Container>
    </RunStepProvider>
  );
}
