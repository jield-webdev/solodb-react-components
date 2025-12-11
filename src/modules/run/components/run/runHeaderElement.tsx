import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import RunProvider from "@/modules/run/providers/runProvider";
import RunHeader from "@/modules/run/components/run/partial/runHeader";
import RunTabs from "@/modules/run/components/run/partial/runTabs";

export default function RunHeaderElement() {
  return (
    <RunProvider>
      <Container fluid>
        <RunHeader />
        <RunTabs className={"mb-4"} />
        <Outlet />
      </Container>
    </RunProvider>
  );
}
