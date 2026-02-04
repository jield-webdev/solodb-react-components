import React from "react";
import { ServiceEventReportResult } from "@jield/solodb-typescript-core";

export default function Criterion({
  result,
  value,
  onChange,
  error,
  onSubmit,
  saving,
}: {
  result: ServiceEventReportResult;
  value: any;
  onChange: (cv: ServiceEventReportResult, raw: any) => void;
  error?: string;
  onSubmit: (cv: ServiceEventReportResult) => void;
  saving?: boolean;
}) {
  const criterionVersion = result.criterion_version;
  const wrapperStyle =
    criterionVersion.criterion.background_color && criterionVersion.criterion.has_background_color
      ? { backgroundColor: criterionVersion.criterion.background_color }
      : undefined;

  return (
    <div
      className={`form-group mb-3 rounded ${criterionVersion.highlighted ? "border border-warning" : ""}`}
      style={wrapperStyle}
    >
      <label htmlFor={`result-${result.id}`} className="form-label">
        {criterionVersion.criterion.criterion}
        {criterionVersion.required && <span className="text-danger">*</span>}
      </label>

      {(() => {
        // base props for simple inputs
        const inputProps = {
          id: `result-${result.id}`,
          value: value ?? "",
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            onChange(result, e.target.value),
        };

        switch (criterionVersion.criterion.input_type) {
          case "integer":
          case "float":
            return (
              <input
                {...inputProps}
                type="number"
                step={criterionVersion.criterion.input_type === "float" ? "0.01" : "1"}
                className={`form-control ${error ? "is-invalid" : ""}`}
              />
            );

          case "date":
            return <input {...inputProps} type="date" className={`form-control ${error ? "is-invalid" : ""}`} />;

          case "text":
            return <textarea {...inputProps} className={`form-control ${error ? "is-invalid" : ""}`} rows={3} />;

          case "string":
            return <input {...inputProps} type="text" className={`form-control ${error ? "is-invalid" : ""}`} />;

          case "select":
            return (
              <select {...inputProps} className={`form-select ${error ? "is-invalid" : ""}`}>
                <option value="">-- select --</option>
                {Object.entries(criterionVersion.criterion.values).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            );

          case "radio": {
            const { id, value: current, onChange: handle } = inputProps;
            const strVal = String(current ?? "");
            return (
              <div className={`form-check ${error ? "is-invalid" : ""}`}>
                {Object.entries(criterionVersion.criterion.values).map(([key, label]) => (
                  <div key={key} className="form-check">
                    <input
                      type="radio"
                      id={`${id}_${key}`}
                      name={id}
                      value={key}
                      checked={strVal === key}
                      onChange={handle}
                      className="form-check-input"
                    />
                    <label htmlFor={`${id}_${key}`} className="form-check-label">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            );
          }

          case "checkbox": {
            const { id: id, value: current, onChange: _ } = inputProps;
            // ensure an array
            const selected: string[] = Array.isArray(current) ? current : [];

            // toggle a single key
            const toggle = (key: string, checked: boolean) => {
              const next = checked ? [...selected, key] : selected.filter((k) => k !== key);
              onChange(result, next);
            };

            return (
              <div className={`form-check ${error ? "is-invalid" : ""}`}>
                {Object.entries(criterionVersion.criterion.values).map(([key, label]) => (
                  <div key={key} className="form-check">
                    <input
                      type="checkbox"
                      id={`${id}_${key}`}
                      name={id}
                      value={key}
                      checked={selected.includes(key)}
                      onChange={(e) => toggle(key, e.target.checked)}
                      className="form-check-input"
                    />
                    <label htmlFor={`${id}_${key}`} className="form-check-label">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            );
          }

          case "bool": {
            return (
              <div className={`form-check form-switch ${error ? "is-invalid" : ""}`}>
                <input
                  type="checkbox"
                  {...inputProps}
                  checked={!!value}
                  onChange={(e) => onChange(result, e.target.checked)}
                  className="form-check-input"
                />
              </div>
            );
          }

          case "action": {
            return (
              <div className={`d-flex align-items-center ${error ? "is-invalid" : ""}`}>
                <label className="me-2">Done </label>
                <div role="group" aria-label={`${result.id}-action`} className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className={`btn ${value ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => onChange(result, true)}
                    aria-pressed={value}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`btn ${!value ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => onChange(result, false)}
                    aria-pressed={!value}
                  >
                    No
                  </button>
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })()}

      {criterionVersion.criterion.help_block && (
        <small className="form-text text-muted">{criterionVersion.criterion.help_block}</small>
      )}
      {error && <div className="invalid-feedback">{error}</div>}

      <div className="mt-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onSubmit(result)} disabled={!!saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
