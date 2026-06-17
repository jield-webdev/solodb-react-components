import {
  listOrganisationGroups,
  listOrganisationProjects,
  listOrganisationTeams,
  ProjectPurpose,
  type Run,
  TeamPurpose,
} from "@jield/solodb-typescript-core";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
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
  conclusion: string;
  runType: "research" | "production";
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
  const [runType, setRunType] = useState<"research" | "production">("research");
  const [parts, setParts] = useState(1);
  const [location, setLocation] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const { data: groupsData, isError: isGroupsError, isLoading: isGroupsLoading } = useQuery({
    queryKey: ["organisation-groups", environment],
    queryFn: () => listOrganisationGroups({ environment }),
  });

  const { data: teamsData, isError: isTeamsError, isLoading: isTeamsLoading } = useQuery({
    queryKey: ["organisation-teams", environment, TeamPurpose.Run],
    queryFn: () => listOrganisationTeams({ environment, purpose: TeamPurpose.Run }),
  });

  const { data: projectsData, isError: isProjectsError, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["organisation-projects", environment, ProjectPurpose.Run],
    queryFn: () => listOrganisationProjects({ environment, purpose: ProjectPurpose.Run }),
  });

  const trimmedName = name.trim();
  const trimmedMotivation = motivation.trim();
  const isOrganisationLoading = isGroupsLoading || isTeamsLoading || isProjectsLoading;
  const hasOrganisationError = isGroupsError || isTeamsError || isProjectsError;
  const groups = groupsData?.items ?? [];
  const teams = teamsData?.items ?? [];
  const projects = projectsData?.items ?? [];
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
      conclusion,
      runType,
    });
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
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
        {hasAttemptedSubmit && hasOrganisationError && (
          <Alert variant="warning">Could not load organisation values.</Alert>
        )}

        <OrganisationSelect
          controlId="create-run-group"
          label="Group"
          options={groups}
          isLoading={isGroupsLoading}
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
          isLoading={isTeamsLoading}
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
          isLoading={isProjectsLoading}
          value={projectId}
          onChange={setProjectId}
          showError={hasAttemptedSubmit && !hasValidProject}
          disabled={isSubmitting}
          helpText="Select the project to which this run belongs"
        />
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
        <SelectionOverview
          selectedRuns={selectedRuns}
          selectedSubstrates={selectedSubstrates}
          partIdsByRunId={partIdsByRunId}
        />
      </FormSection>

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
