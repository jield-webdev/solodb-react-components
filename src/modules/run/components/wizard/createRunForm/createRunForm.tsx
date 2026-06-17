import {
  listOrganisationGroups,
  listOrganisationProjects,
  listOrganisationTeams,
  ProjectPurpose,
  type Run,
  RunTypeEnum,
  TeamPurpose,
} from "@jield/solodb-typescript-core";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { type SelectedSubstrate } from "../substrateSelect";
import FormSection from "./formSection";
import OrganisationSelect from "./organisationSelect";
import SelectionOverview from "./selectionOverview";

export type CreateRunFormValues = {
  name: string;
  motivation: string;
  groupId: number;
  teamId: number;
  projectId: number;
  parts: number;
  location: string;
  runType: RunTypeEnum;
};

type CreateRunFormProps = {
  isSubmitting: boolean;
  errorMessage?: string;
  selectedRuns: Run[];
  selectedSubstrates: SelectedSubstrate[];
  partIdsByRunId: Record<number, number[]>;
  onBack: () => void;
  onSubmit: (values: CreateRunFormValues) => void;
};

export default function CreateRunForm({
  isSubmitting,
  errorMessage,
  selectedRuns,
  selectedSubstrates,
  partIdsByRunId,
  onBack,
  onSubmit,
}: CreateRunFormProps) {
  const { environment } = useParams();
  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [runType, setRunType] = useState<RunTypeEnum>(RunTypeEnum.RESEARCH);
  const [parts, setParts] = useState(1);
  const [location, setLocation] = useState("");
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
  const hasOrganisationValues = hasValidGroup && hasValidTeam && hasValidProject;
  const canSubmit =
    !isNameMissing &&
    !isMotivationMissing &&
    hasOrganisationValues &&
    !isOrganisationLoading &&
    !hasOrganisationError &&
    !isSubmitting;

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
      runType,
    });
  };

  return (
    <Form noValidate onSubmit={handleSubmit} className={"form-horizontal"}>
      <FormSection title="Details">
        <Form.Group as={Row} className="mb-3" controlId="create-run-name">
          <Form.Label column sm={3}>
            Run name <span className="text-danger">*</span>
          </Form.Label>
          <Col sm={9}>
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
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="create-run-location">
          <Form.Label column sm={3}>
            Sample location
          </Form.Label>
          <Col sm={9}>
            <Form.Control
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location of the samples"
              disabled={isSubmitting}
            />
            <Form.Text muted>Give here the location where the run samples are stored</Form.Text>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="create-run-motivation">
          <Form.Label column sm={3}>
            Motivation <span className="text-danger">*</span>
          </Form.Label>
          <Col sm={9}>
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
            {showMotivationError && (
              <Form.Control.Feedback type="invalid">Motivation is required.</Form.Control.Feedback>
            )}
            <Form.Text muted>Explain here the motivation for this run</Form.Text>
          </Col>
        </Form.Group>
      </FormSection>

      <FormSection title="Organisation">
        {hasAttemptedSubmit && hasOrganisationError && (
          <Alert variant="warning">Could not load organisation values.</Alert>
        )}

        <OrganisationSelect
          controlId="create-run-group"
          label="Group"
          options={groups}
          isLoading={groupsQuery.isLoading}
          value={groupId}
          onChange={setGroupId}
          showError={hasAttemptedSubmit && !hasValidGroup}
          disabled={isSubmitting}
          helpText="Select the group to which this run belongs"
        />

        <OrganisationSelect
          controlId="create-run-team"
          label="Team"
          options={teams}
          isLoading={teamsQuery.isLoading}
          value={teamId}
          onChange={setTeamId}
          showError={hasAttemptedSubmit && !hasValidTeam}
          disabled={isSubmitting}
          helpText="Select the team to which this run belongs"
        />

        <OrganisationSelect
          controlId="create-run-project"
          label="Project"
          options={projects}
          isLoading={projectsQuery.isLoading}
          value={projectId}
          onChange={setProjectId}
          showError={hasAttemptedSubmit && !hasValidProject}
          disabled={isSubmitting}
          helpText="Select the project to which this run belongs"
        />
      </FormSection>

      <FormSection title="Parts">
        <Form.Group as={Row} className="mb-3" controlId="create-run-parts">
          <Form.Label column sm={3}>
            Experimental split
          </Form.Label>
          <Col sm={9}>
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
          </Col>
        </Form.Group>
      </FormSection>

      <FormSection title="Type">
        <Form.Group as={Row} className="mb-3" controlId="create-run-type">
          <Form.Label column sm={3}>
            Run type
          </Form.Label>
          <Col sm={9}>
            <Form.Select
              value={runType}
              onChange={(event) => setRunType(event.target.value as unknown as RunTypeEnum)}
              disabled={isSubmitting}
            >
              <option value={RunTypeEnum.RESEARCH}>Research</option>
              <option value={RunTypeEnum.PRODUCTION}>Production</option>
            </Form.Select>
          </Col>
        </Form.Group>
      </FormSection>

      <Row className={"my-3"}>
        <Col sm={9} className={"offset-sm-3"}>
          <SelectionOverview
            selectedRuns={selectedRuns}
            selectedSubstrates={selectedSubstrates}
            partIdsByRunId={partIdsByRunId}
          />
        </Col>
      </Row>

      {errorMessage && (
        <Alert variant="danger" className="mb-4">
          {errorMessage}
        </Alert>
      )}

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
