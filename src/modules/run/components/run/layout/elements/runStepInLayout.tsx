import { Link, useParams } from "react-router-dom";
import { RunStep, Run, RunPart, listRunStepParts, RunStepPart } from "@jield/solodb-typescript-core";
import { RunLayoutPartList } from "./runLayoutPartList";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { Placeholder } from "react-bootstrap";

export default function RunStepInLayout({ step, parts, run }: { step: RunStep; parts: RunPart[]; run: Run }) {
  const { environment } = useParams();

  const queries = useQueries({
    queries: [
      {
        queryKey: ["runStepParts", step.id],
        queryFn: () => listRunStepParts({ step }),
        placeholderData: keepPreviousData,
      },
    ],
  });

  const [runStepPartsQuery] = queries;

  const stepParts = useMemo(
    () => (runStepPartsQuery.data?.items ?? []) as RunStepPart[],
    [runStepPartsQuery.data?.items]
  );

  const leveledParts = useMemo(
    () =>
      parts
        .filter((p) => p.part_level === step.part_level)
        .sort((a, b) => {
          if (a.root_id && b.root_id && a.root_id !== b.root_id) {
            return a.root_id - b.root_id;
          }
          return a.left - b.left;
        }),
    [parts]
  );

  return (
    <tr>
      <td>
        <Link to={`/${environment}/operator/run/step/${step.id}`}>
          {" "}
          <span
            dangerouslySetInnerHTML={{
              __html: step.name,
            }}
          />
        </Link>
      </td>
      <td>
        {runStepPartsQuery.isLoading ? (
          <Placeholder animation="glow" as="div" className="d-flex flex-wrap gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Placeholder key={index} style={{ width: "4.5rem", height: "1.5rem", borderRadius: "3px" }} />
            ))}
          </Placeholder>
        ) : (
          <RunLayoutPartList step={step} parts={leveledParts} stepParts={stepParts} run={run} />
        )}
      </td>
    </tr>
  );
}
