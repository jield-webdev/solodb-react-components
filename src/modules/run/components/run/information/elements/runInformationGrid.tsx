import React, { useContext } from "react";
import { RunContext } from "@jield/solodb-react-components/modules/run/contexts/runContext";
import { RunTypeEnum } from "@jield/solodb-typescript-core";
import { Link, useParams } from "react-router-dom";
import { getSolodbServerCleanUrl } from "@jield/solodb-react-components/modules/core/config/runtimeConfig";

export default function RunInformationGrid() {
  const { run } = useContext(RunContext);

  const { environment } = useParams();

  const isResearch = run.run_type === RunTypeEnum.RESEARCH;
  const isProduction = run.run_type === RunTypeEnum.PRODUCTION;
  const runTypeLabel = isResearch ? "Research" : isProduction ? "Production" : String(run.run_type);

  return (
    <div className="row g-4 mt-1">
      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-tag text-primary mt-1" />
          <div>
            <div className="text-muted small">Name</div>
            <div className="fw-semibold">{run.name ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className={`fa ${isResearch ? "fa-flask text-info" : "fa-industry text-primary"} mt-1`} />
          <div>
            <div className="text-muted small">Run Type</div>
            <span className={`badge ${isResearch ? "bg-info" : "bg-primary"}`}>{runTypeLabel}</span>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-calendar-plus-o text-muted mt-1" />
          <div>
            <div className="text-muted small">Created</div>
            <div className="fw-semibold">
              {run.date_created ? new Date(run.date_created).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-certificate mt-1" />
          <div>
            <div className="text-muted small">Status</div>
            <div className="fw-semibold">{run.status ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-user-circle-o text-warning mt-1" />
          <div>
            <div className="text-muted small">Responsible</div>
            <div className="fw-semibold">{run.responsible?.full_name ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-play-circle-o text-success mt-1" />
          <div>
            <div className="text-muted small">Start Date</div>
            <div className="fw-semibold">{run.start_date ? new Date(run.start_date).toLocaleDateString() : "—"}</div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-briefcase text-secondary mt-1" />
          <div>
            <div className="text-muted small">Project</div>
            <div className="fw-semibold">{run.project?.name ?? "No project"}</div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-tasks text-primary mt-1" />
          <div>
            <div className="text-muted small">Steps</div>
            <div className="fw-semibold">{run.amount_of_steps ?? "—"}</div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-clock-o text-muted mt-1" />
          <div>
            <div className="text-muted small">Last Update</div>
            <div className="fw-semibold">{run.last_update ? new Date(run.last_update).toLocaleDateString() : "—"}</div>
          </div>
        </div>
      </div>

      {run.priority && (
        <div className="col-sm-4">
          <div className="d-flex align-items-start gap-2">
            <i className="fa fa-flag text-danger mt-1" />
            <div>
              <div className="text-muted small">Priority</div>
              <span className="badge bg-danger">{run.priority.priority.code}</span>
              {run.priority.description && <div className="text-muted small mt-1">{run.priority.description}</div>}
            </div>
          </div>
        </div>
      )}

      {run.hold_code && (
        <div className="col-sm-4">
          <div className="d-flex align-items-start gap-2">
            <i className="fa fa-ban text-danger mt-1" />
            <div>
              <div className="text-muted small">Hold Code</div>
              <span className="badge bg-danger">{run.hold_code.hold_code.code}</span>
              {run.hold_code.description && <div className="text-muted small mt-1">{run.hold_code.description}</div>}
            </div>
          </div>
        </div>
      )}

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-users text-secondary mt-1" />
          <div>
            <div className="text-muted small">Team</div>
            <div className="fw-semibold">
              <Link
                to={`${getSolodbServerCleanUrl()}${environment}/organisation/team/details/${run.team.id}/responsible-users.html`}
              >
                {run.team?.name ?? "—"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="col-sm-4">
        <div className="d-flex align-items-start gap-2">
          <i className="fa fa-object-group text-secondary mt-1" />
          <div>
            <div className="text-muted small">Group</div>
            <div className="fw-semibold">
              <Link
                to={`${getSolodbServerCleanUrl()}${environment}/organisation/group/details/${run.group.id}/responsible-users.html`}
              >
                {run.group?.name ?? "—"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
