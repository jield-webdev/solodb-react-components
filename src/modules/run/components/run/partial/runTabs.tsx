import { Nav } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useContext } from "react";
import { RunContext } from "@/modules/run/contexts/runContext";

export default function RunTabs(props: { className?: string }) {
  const { run, reloadRun } = useContext(RunContext);
  const { environment } = useParams();

  const url = window.location.pathname;

  //Create a list of links for the permit tabs so we can iterate over them in the render method
  let links = [
    {
      title: "Information",
      link: `/${environment}/operator/run/details/${run.id}/information`,
    },
  ];

  links.push({
    title: "Steps",
    link: `/${environment}/operator/run/details/${run.id}/steps`,
  });

  //Now we can render the tabs
  return (
    <Nav variant="tabs" className={props.className} defaultActiveKey="/home" activeKey={url}>
      {links.map((link, i) => {
        return (
          <Nav.Item key={i}>
            <Link to={link.link} className={"nav-link " + (link.link === url ? "active" : "")}>
              {link.title}
            </Link>
          </Nav.Item>
        );
      })}
    </Nav>
  );
}
