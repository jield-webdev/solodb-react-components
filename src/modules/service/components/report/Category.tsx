import { useCallback, useEffect, useState } from "react";
import Criterion from "./Criterion";
import axios from "axios";
import { ServiceEventReportResult } from "solodb-typescript-core";

// Cache structure: { [category: string]: { values: Record<number, any>, errors: Record<number, string> } }
type FormCache = Record<
  string,
  {
    values: Record<number, any>;
    errors: Record<number, string>;
  }
>;

export default function Category({
  categoryId,
  label,
  results,
}: {
  categoryId: string | number;
  label: string;
  results: ServiceEventReportResult[];
}) {
  const [formCache, setFormCache] = useState<FormCache>({});
  const [values, setValues] = useState<Record<number, any>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [savingById, setSavingById] = useState<Record<number, boolean>>({});

  // Initialize or restore form state when category changes
  useEffect(() => {
    const cacheKey = String(categoryId);
    // Create or update cache entry if it doesn't exist
    if (!formCache[cacheKey]) {
      const init: Record<number, any> = {};

      results.forEach((result: ServiceEventReportResult) => {
        const criterionVersion = result.criterion_version;

        if (criterionVersion.criterion.input_type === "checkbox") {
          const val = result.value || criterionVersion.default_value || "";
          init[result.id] = val ? val.toString().split(", ") : [];
        } else if (
          criterionVersion.criterion.input_type === "bool" ||
          criterionVersion.criterion.input_type === "action"
        ) {
          const val = result.value ?? criterionVersion.default_value ?? "false";
          init[result.id] = val === "true";
        } else {
          init[result.id] = result.value ?? criterionVersion.default_value ?? "";
        }
      });

      // Create new cache entry
      const newCache = {
        ...formCache,
        [cacheKey]: {
          values: init,
          errors: {},
        },
      };

      setFormCache(newCache);
      setValues(init);
      setErrors({});
    } else {
      // Restore from cache
      setValues(formCache[cacheKey].values);
      setErrors(formCache[cacheKey].errors);
    }
  }, [categoryId]); // Only run when the category changes

  // Update cache when values/errors change
  useEffect(() => {
    const key = String(categoryId);
    if (formCache[key]) {
      setFormCache((prev) => ({
        ...prev,
        [key]: {
          values,
          errors,
        },
      }));
    }
  }, [values, errors, categoryId]); // Update cache when form state changes

  const submitOne = async (result: ServiceEventReportResult) => {
    const id = result.id;
    const val = values[id];
    const criterionVersion = result.criterion_version;

    // Validate only this field when required
    const isEmpty = val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);

    if (criterionVersion.required && isEmpty) {
      setErrors((prev) => ({ ...prev, [id]: "This field is required." }));
      return;
    }

    // clear previous error for this id
    setErrors((prev) => {
      const { [id]: _omit, ...rest } = prev;
      return rest;
    });

    setSavingById((prev) => ({ ...prev, [id]: true }));

    let valueToSend: any = val;
    if (Array.isArray(val)) {
      valueToSend = val.join(", ");
    } else if (typeof val === "boolean") {
      valueToSend = val ? "true" : "false";
    }

    try {
      await axios.patch(`/update/service/event/report/result/${id}`, { value: valueToSend });
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSavingById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleValueChange = useCallback((result: ServiceEventReportResult, raw: any) => {
    setValues((prev) => ({
      ...prev,
      [result.id]: raw,
    }));
  }, []);

  return (
    <div>
      <legend>{label}</legend>
      {results.map((result) => {
        return (
          <Criterion
            key={result.id}
            result={result}
            value={values[result.id]}
            onChange={handleValueChange}
            error={errors[result.id]}
            onSubmit={submitOne}
            saving={savingById[result.id]}
          />
        );
      })}
    </div>
  );
}
