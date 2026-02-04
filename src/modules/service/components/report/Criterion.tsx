import React from "react";
import { ServiceEventReportResult } from "@jield/solodb-typescript-core";
import { Controller, useFormContext } from "react-hook-form";

type CriterionValue = string | boolean | string[] | null;
type FormValues = Record<string, CriterionValue>;
type SaveStatusState = "idle" | "dirty" | "saving" | "saved" | "error";
type SaveStatus = {
  state: SaveStatusState;
  message?: string;
  savedAt?: number;
};

export default function Criterion({
  result,
  status,
  onAutoSave,
  onDirty,
}: {
  result: ServiceEventReportResult;
  status?: SaveStatus;
  onAutoSave: (cv: ServiceEventReportResult) => void;
  onDirty: (resultId: number) => void;
}) {
  const { control, formState } = useFormContext<FormValues>();
  const criterionVersion = result.criterion_version;
  const fieldName = String(result.id);
  const wrapperStyle =
    criterionVersion.criterion.background_color && criterionVersion.criterion.has_background_color
      ? { backgroundColor: criterionVersion.criterion.background_color }
      : undefined;
  const fieldError = formState.errors[fieldName];
  const errorMessage = (fieldError as { message?: string } | undefined)?.message;
  const isRequired = criterionVersion.required;
  const validateRequired = (value: CriterionValue) => {
    if (!isRequired) {
      return true;
    }
    if (Array.isArray(value)) {
      return value.length > 0 || "This field is required.";
    }
    if (typeof value === "boolean") {
      return true;
    }
    return value !== undefined && value !== null && value !== "" ? true : "This field is required.";
  };

  const validationClassName = (() => {
    if (errorMessage) {
      return "is-invalid";
    }
    if (status?.state === "saved") {
      return "is-valid";
    }
    if (status?.state === "dirty") {
      return "border-warning";
    }
    return "";
  })();
  const groupValidationClassName = (() => {
    if (errorMessage) {
      return "border border-danger rounded p-2";
    }
    if (status?.state === "saved") {
      return "border border-success rounded p-2";
    }
    if (status?.state === "dirty") {
      return "border border-warning rounded p-2";
    }
    return "";
  })();
  const stringValue = (value: CriterionValue) => (typeof value === "string" ? value : "");
  const criterionValues = criterionVersion.criterion.values ?? {};

  return (
    <div
      className={`form-group mb-3 rounded ${criterionVersion.highlighted ? "border border-warning" : ""}`}
      style={wrapperStyle}
    >
      <label htmlFor={`result-${result.id}`} className="form-label">
        {criterionVersion.criterion.criterion}
        {criterionVersion.required && <span className="text-danger">*</span>}
      </label>

      <Controller
        name={fieldName}
        control={control}
        rules={{ validate: validateRequired }}
        render={({ field }): React.ReactElement => {
          switch (criterionVersion.criterion.input_type) {
            case "integer":
            case "float":
              return (
                <input
                  id={`result-${result.id}`}
                  type="number"
                  step={criterionVersion.criterion.input_type === "float" ? "0.01" : "1"}
                  className={`form-control ${validationClassName}`}
                  value={stringValue(field.value)}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onDirty(result.id);
                  }}
                  onBlur={() => {
                    field.onBlur();
                    onAutoSave(result);
                  }}
                />
              );

            case "date":
              return (
                <input
                  id={`result-${result.id}`}
                  type="date"
                  className={`form-control ${validationClassName}`}
                  value={stringValue(field.value)}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onDirty(result.id);
                  }}
                  onBlur={() => {
                    field.onBlur();
                    onAutoSave(result);
                  }}
                />
              );

            case "text":
              return (
                <textarea
                  id={`result-${result.id}`}
                  className={`form-control ${validationClassName}`}
                  rows={3}
                  value={stringValue(field.value)}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onDirty(result.id);
                  }}
                  onBlur={() => {
                    field.onBlur();
                    onAutoSave(result);
                  }}
                />
              );

            case "string":
              return (
                <input
                  id={`result-${result.id}`}
                  type="text"
                  className={`form-control ${validationClassName}`}
                  value={stringValue(field.value)}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onDirty(result.id);
                  }}
                  onBlur={() => {
                    field.onBlur();
                    onAutoSave(result);
                  }}
                />
              );

            case "select":
              return (
                <select
                  id={`result-${result.id}`}
                  className={`form-select ${validationClassName}`}
                  value={stringValue(field.value)}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    onDirty(result.id);
                    onAutoSave(result);
                  }}
                >
                  <option value="">-- select --</option>
                  {Object.entries(criterionValues).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              );

            case "radio": {
              const current = String(field.value ?? "");
              return (
                <div className={`form-check ${groupValidationClassName}`}>
                  {Object.entries(criterionValues).map(([key, label]) => (
                    <div key={key} className="form-check">
                      <input
                        type="radio"
                        id={`result-${result.id}_${key}`}
                        name={`result-${result.id}`}
                        value={key}
                        checked={current === key}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          onDirty(result.id);
                          onAutoSave(result);
                        }}
                        className={`form-check-input ${validationClassName}`}
                      />
                      <label htmlFor={`result-${result.id}_${key}`} className="form-check-label">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              );
            }

            case "checkbox": {
              const selected: string[] = Array.isArray(field.value) ? field.value : [];
              const toggle = (key: string, checked: boolean) => {
                const next = checked ? [...selected, key] : selected.filter((k) => k !== key);
                field.onChange(next);
                onDirty(result.id);
                onAutoSave(result);
              };

              return (
                <div className={`form-check ${groupValidationClassName}`}>
                  {Object.entries(criterionValues).map(([key, label]) => (
                    <div key={key} className="form-check">
                      <input
                        type="checkbox"
                        id={`result-${result.id}_${key}`}
                        name={`result-${result.id}`}
                        value={key}
                        checked={selected.includes(key)}
                        onChange={(e) => toggle(key, e.target.checked)}
                        className={`form-check-input ${validationClassName}`}
                      />
                      <label htmlFor={`result-${result.id}_${key}`} className="form-check-label">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              );
            }

            case "bool":
              return (
                <div className={`form-check form-switch ${groupValidationClassName}`}>
                  <input
                    type="checkbox"
                    id={`result-${result.id}`}
                    checked={!!field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      onDirty(result.id);
                      onAutoSave(result);
                    }}
                    className={`form-check-input ${validationClassName}`}
                  />
                </div>
              );

            case "action":
              return (
                <div className={`d-flex align-items-center ${groupValidationClassName}`}>
                  <label className="me-2">Done </label>
                  <div
                    role="group"
                    aria-label={`${result.id}-action`}
                    className="btn-group btn-group-sm"
                  >
                    <button
                      type="button"
                      className={`btn ${field.value ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => {
                        field.onChange(true);
                        onDirty(result.id);
                        onAutoSave(result);
                      }}
                      aria-pressed={!!field.value}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`btn ${!field.value ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => {
                        field.onChange(false);
                        onDirty(result.id);
                        onAutoSave(result);
                      }}
                      aria-pressed={!field.value}
                    >
                      No
                    </button>
                  </div>
                </div>
              );

            default:
              return <></>;
          }
        }}
      />

      {criterionVersion.criterion.help_block && (
        <small className="form-text text-muted">{criterionVersion.criterion.help_block}</small>
      )}
      {errorMessage && <div className="invalid-feedback">{errorMessage}</div>}
    </div>
  );
}
