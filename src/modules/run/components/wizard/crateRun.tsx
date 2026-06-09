import {
  listOrganisationGroups,
  listOrganisationProjects,
  listOrganisationTeams,
  ProjectPurpose,
  type Run,
  TeamPurpose,
} from "@jield/solodb-typescript-core";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";
import { Alert, Badge, Button, Col, Form, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { type SelectedSubstrate } from "./substrateSelect";

// A labelled section: the title sits on the left, the controls are padded to the
// right, and a divider separates it from the previous section.
function FormSection({ title, isFirst = false, children }: { title: string; isFirst?: boolean; children: ReactNode }) {
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

export type CreateRunFormValues = {
  name: string;
  motivation: string;
  groupId: number;
  teamId: number;
  projectId: number;
  parts: number;
  location: string;
  conclusion: string;
  runType: "research" | "production";
};

type CreateRunFormProps = {
  isSubmitting: boolean;
  errorMessage?: string;
  selectedRuns: Run[];
  selectedSubstrates: SelectedSubstrate[];
  selectedPartIdsByRunId: Record<number, number[]>;
  onBack: () => void;
  onSubmit: (values: CreateRunFormValues) => void;
};

const parseSelectedId = (value: string): number | null => {
  if (value === "") {
    return null;
  }

  const id = Number(value);
  return Number.isFinite(id) ? id : null;
};

export default function CreateRunForm({
  isSubmitting,
  errorMessage,
  selectedRuns,
  selectedSubstrates,
  selectedPartIdsByRunId,
  onBack,
  onSubmit,
}: CreateRunFormProps) {
  const { environment } = useParams();
  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [runType, setRunType] = useState<"research" | "production">("research");
  const [parts, setParts] = useState(1);
  const [location, setLocation] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const groupsQuery = useQuery({
    queryKey: ["organisation-groups", environment],
    queryFn: () => listOrganisationGroups({ environment }),
  });

  const teamsQuery = useQuery({
    queryKey: ["organisation-teams", environment, TeamPurpose.Run],
    queryFn: () => listOrganisationTeams({ environment, purpose: TeamPurpose.Run }),
  });

  const projectsQuery = useQuery({
    queryKey: ["organisation-projects", environment, ProjectPurpose.Run],
    queryFn: () => listOrganisationProjects({ environment, purpose: ProjectPurpose.Run }),
  });

  const trimmedName = name.trim();
  const trimmedMotivation = motivation.trim();
  const isOrganisationLoading = groupsQuery.isLoading || teamsQuery.isLoading || projectsQuery.isLoading;
  const hasOrganisationError = groupsQuery.isError || teamsQuery.isError || projectsQuery.isError;
  const groups = groupsQuery.data?.items ?? [];
  const teams = teamsQuery.data?.items ?? [];
  const projects = projectsQuery.data?.items ?? [];
  const hasValidGroup = groupId !== null && groups.some((group) => group.id === groupId);
  const hasValidTeam = teamId !== null && teams.some((team) => team.id === teamId);
  const hasValidProject = projectId !== null && projects.some((project) => project.id === projectId);
  const isNameMissing = trimmedName === "";
  const isMotivationMissing = trimmedMotivation === "";
  const showNameError = hasAttemptedSubmit && isNameMissing;
  const showMotivationError = hasAttemptedSubmit && isMotivationMissing;
  const showGroupError = hasAttemptedSubmit && !hasValidGroup;
  const showTeamError = hasAttemptedSubmit && !hasValidTeam;
  const showProjectError = hasAttemptedSubmit && !hasValidProject;
  const hasOrganisationValues = hasValidGroup && hasValidTeam && hasValidProject;
  const canSubmit =
    !isNameMissing &&
    !isMotivationMissing &&
    hasOrganisationValues &&
    !isOrganisationLoading &&
    !hasOrganisationError &&
    !isSubmitting;
  const organisationErrorMessage = hasOrganisationError ? "Could not load organisation values." : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasAttemptedSubmit(true);

    if (!canSubmit) {
      return;
    }

    onSubmit({
      name: trimmedName,
      motivation: trimmedMotivation,
      groupId,
      teamId,
      projectId,
      parts: Number.isFinite(parts) ? Math.max(1, parts) : 1,
      location,
      conclusion,
      runType,
    });
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      {errorMessage && (
        <Alert variant="danger" className="mb-4">
          {errorMessage}
        </Alert>
      )}

      <FormSection title="Details" isFirst>
        <Form.Group controlId="create-run-name">
          <Form.Label>
            Run name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Give a run name"
            required
            disabled={isSubmitting}
            isInvalid={showNameError}
          />
          {showNameError && <Form.Control.Feedback type="invalid">Run name is required.</Form.Control.Feedback>}
          <Form.Text muted>Give a short and descriptive name for the run</Form.Text>
        </Form.Group>

        <Form.Group controlId="create-run-location">
          <Form.Label>Sample location</Form.Label>
          <Form.Control
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location of the samples"
            disabled={isSubmitting}
          />
          <Form.Text muted>Give here the location where the run samples are stored</Form.Text>
        </Form.Group>

        <Form.Group controlId="create-run-motivation">
          <Form.Label>
            Motivation <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
            placeholder="Why is this run being created?"
            required
            disabled={isSubmitting}
            isInvalid={showMotivationError}
          />
          {showMotivationError && <Form.Control.Feedback type="invalid">Motivation is required.</Form.Control.Feedback>}
          <Form.Text muted>Explain here the motivation for this run</Form.Text>
        </Form.Group>

        <Form.Group controlId="create-run-conclusion">
          <Form.Label>Conclusion</Form.Label>
          <Form.Control
            type="text"
            value={conclusion}
            onChange={(event) => setConclusion(event.target.value)}
            placeholder="Optional"
            disabled={isSubmitting}
          />
          <Form.Text muted>Explain the conclusion of this run</Form.Text>
        </Form.Group>
      </FormSection>

      <FormSection title="Organisation">
        {hasAttemptedSubmit && organisationErrorMessage && <Alert variant="warning">{organisationErrorMessage}</Alert>}

        <Form.Group controlId="create-run-group">
          <Form.Label>
            Group <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            value={groupId ?? ""}
            onChange={(event) => setGroupId(parseSelectedId(event.target.value))}
            required
            disabled={isSubmitting}
            isInvalid={showGroupError}
          >
            <option value="">{groupsQuery.isLoading ? "Loading groups..." : "Select a group"}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </Form.Select>
          {showGroupError && (
            <Form.Control.Feedback type="invalid">
              {groupsQuery.isLoading ? "Groups are still loading." : "Select a group."}
            </Form.Control.Feedback>
          )}
          <Form.Text muted>Select the group to which this run belongs</Form.Text>
        </Form.Group>

        <Form.Group controlId="create-run-team">
          <Form.Label>
            Team <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            value={teamId ?? ""}
            onChange={(event) => setTeamId(parseSelectedId(event.target.value))}
            required
            disabled={isSubmitting}
            isInvalid={showTeamError}
          >
            <option value="">{teamsQuery.isLoading ? "Loading teams..." : "Select a team"}</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.label}
              </option>
            ))}
          </Form.Select>
          {showTeamError && (
            <Form.Control.Feedback type="invalid">
              {teamsQuery.isLoading ? "Teams are still loading." : "Select a team."}
            </Form.Control.Feedback>
          )}
          <Form.Text muted>Select the team to which this run belongs</Form.Text>
        </Form.Group>

        <Form.Group controlId="create-run-project">
          <Form.Label>
            Project <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            value={projectId ?? ""}
            onChange={(event) => setProjectId(parseSelectedId(event.target.value))}
            required
            disabled={isSubmitting}
            isInvalid={showProjectError}
          >
            <option value="">{projectsQuery.isLoading ? "Loading projects..." : "Select a project"}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.label}
              </option>
            ))}
          </Form.Select>
          {showProjectError && (
            <Form.Control.Feedback type="invalid">
              {projectsQuery.isLoading ? "Projects are still loading." : "Select a project."}
            </Form.Control.Feedback>
          )}
          <Form.Text muted>Select the project to which this run belongs</Form.Text>
        </Form.Group>
      </FormSection>

      <FormSection title="Parts">
        <Form.Group controlId="create-run-parts">
          <Form.Label>Experimental split</Form.Label>
          <Form.Control
            type="number"
            min={1}
            step={1}
            value={parts}
            onChange={(event) => setParts(Number(event.target.value))}
            disabled={isSubmitting}
          />
          <Form.Text muted>
            Select here the amount of parts (experimental split) this run has, give only the main amount of parts,
            individual parts can be split later
          </Form.Text>
        </Form.Group>
      </FormSection>

      <FormSection title="Type">
        <Form.Group controlId="create-run-type">
          <Form.Label>Run type</Form.Label>
          <Form.Select
            value={runType}
            onChange={(event) => setRunType(event.target.value as "research" | "production")}
            disabled={isSubmitting}
          >
            <option value="research">Research</option>
            <option value="production">Production</option>
          </Form.Select>
        </Form.Group>
      </FormSection>

      <FormSection title="Overview">
        <div>
          <div className="text-secondary small text-uppercase fw-semibold mb-2">
            Parent runs &amp; parts <span className="text-body-tertiary">(selected previously)</span>
          </div>
          {selectedRuns.length === 0 ? (
            <p className="text-secondary fst-italic mb-0">No parent runs selected.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {selectedRuns.map((run) => {
                const selectedPartCount = selectedPartIdsByRunId[run.id]?.length ?? 0;
                return (
                  <div
                    key={run.id}
                    className="d-flex align-items-center justify-content-between gap-3 bg-body-secondary border-0 rounded p-2"
                  >
                    <div className="fw-semibold">
                      {run.label} — {run.name}
                    </div>
                    {selectedPartCount > 0 ? (
                      <Badge bg="secondary" pill className="fw-normal">
                        {selectedPartCount} {selectedPartCount === 1 ? "part" : "parts"}
                      </Badge>
                    ) : (
                      <span className="text-secondary fst-italic small">No parts selected</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="text-secondary small text-uppercase fw-semibold mb-2">
            Substrates <span className="text-body-tertiary">(selected previously)</span>
          </div>
          {selectedSubstrates.length === 0 ? (
            <p className="text-secondary fst-italic mb-0">No substrates selected.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {selectedSubstrates.map(({ substrate, amount }) => (
                <div
                  key={substrate.id}
                  className="d-flex align-items-center justify-content-between gap-3 bg-body-secondary rounded p-2"
                >
                  <div className="fw-semibold">
                    {substrate.label} — {substrate.short_label}
                  </div>
                  <Badge bg="secondary" pill className="fw-normal">
                    Amount: {amount}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      <div className="d-flex justify-content-end mt-4 gap-3">
        <Button variant="outline-secondary" type="button" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Run"}
        </Button>
      </div>
    </Form>
  );
}
