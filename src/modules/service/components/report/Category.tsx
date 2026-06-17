import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Criterion from "./Criterion";
import axios from "axios";
import { ServiceEventReportResult } from "@jield/solodb-typescript-core";
import { FormProvider, useForm, useWatch } from "react-hook-form";

type CriterionValue = string | boolean | string[] | null;
type FormValues = Record<string, CriterionValue>;
type FormCache = Record<string, FormValues>;
type SaveStatusState = "idle" | "dirty" | "saving" | "saved" | "error";
type SaveStatus = {
  state: SaveStatusState;
  message?: string;
  savedAt?: number;
};
type StatusByCategory = {
  categoryId: string;
  statuses: Record<number, SaveStatus>;
};

export default function Category({
  categoryId,
  label,
  results,
}: {
  categoryId: string | number;
  label: string;
  results: ServiceEventReportResult[];
}) {
  const formCacheRef = useRef<FormCache>({});
  const saveTokenRef = useRef<Record<number, number>>({});
  const categoryKey = String(categoryId);
  const [statusByCategory, setStatusByCategory] = useState<StatusByCategory>({ categoryId: categoryKey, statuses: {} });
  const statusById = statusByCategory.categoryId === categoryKey ? statusByCategory.statuses : {};

  const buildInitialValues = useCallback((source: ServiceEventReportResult[]): FormValues => {
    const init: FormValues = {};
    const normalizeToString = (value: string | number | null): string | null => {
      if (value === null) {
        return null;
      }
      return String(value);
    };

    source.forEach((result: ServiceEventReportResult) => {
      const criterionVersion = result.criterion_version;

      if (criterionVersion.criterion.input_type === "checkbox") {
        const val = result.value || criterionVersion.default_value || "";
        init[String(result.id)] = val ? val.toString().split(", ") : [];
      } else if (
        criterionVersion.criterion.input_type === "bool" ||
        criterionVersion.criterion.input_type === "action"
      ) {
        const val = result.value ?? criterionVersion.default_value ?? "false";
        init[String(result.id)] = val === "true";
      } else {
        const val = (result.value ?? criterionVersion.default_value ?? "") as string | number | null;
        init[String(result.id)] = normalizeToString(val) ?? "";
      }
    });

    return init;
  }, []);

  const defaultValues = useMemo(() => buildInitialValues(results), [buildInitialValues, results]);

  const formMethods = useForm<FormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const { control, getValues, reset, trigger } = formMethods;

  // Initialise or restore form state when category changes
  useEffect(() => {
    const cached = formCacheRef.current[categoryKey];

    if (cached) {
      reset(cached);
    } else {
      const init = buildInitialValues(results);
      formCacheRef.current[categoryKey] = init;
      reset(init);
    }
  }, [buildInitialValues, categoryKey, reset, results]);

  const watchedValues = useWatch({ control });

  // Update cache when values change
  useEffect(() => {
    if (!watchedValues) {
      return;
    }

    const entries = Object.entries(watchedValues) as [string, CriterionValue | undefined][];

    formCacheRef.current[categoryKey] = entries.reduce<FormValues>((acc, [fieldKey, value]) => {
      acc[fieldKey] = value ?? null;
      return acc;
    }, {});
  }, [watchedValues, categoryKey]);

  const handleAutoSave = useCallback(
    async (result: ServiceEventReportResult) => {
      const fieldName = String(result.id);
      const isValid = await trigger(fieldName);

      if (!isValid) {
        return;
      }

      const val = getValues(fieldName);
      const nextToken = (saveTokenRef.current[result.id] ?? 0) + 1;
      saveTokenRef.current[result.id] = nextToken;

      setStatusByCategory((prev) => ({
        categoryId: categoryKey,
        statuses: {
          ...(prev.categoryId === categoryKey ? prev.statuses : {}),
          [result.id]: { state: "saving" },
        },
      }));

      let valueToSend: CriterionValue = val ?? "";
      if (Array.isArray(val)) {
        valueToSend = val.join(", ");
      } else if (typeof val === "boolean") {
        valueToSend = val ? "true" : "false";
      }

      try {
        await axios.patch(`/update/service/event/report/result/${result.id}`, { value: valueToSend });
        if (saveTokenRef.current[result.id] === nextToken) {
          setStatusByCategory((prev) => ({
            categoryId: categoryKey,
            statuses: {
              ...(prev.categoryId === categoryKey ? prev.statuses : {}),
              [result.id]: { state: "saved", savedAt: Date.now() },
            },
          }));
        }
      } catch (error) {
        console.error("Failed to save:", error);
        if (saveTokenRef.current[result.id] === nextToken) {
          setStatusByCategory((prev) => ({
            categoryId: categoryKey,
            statuses: {
              ...(prev.categoryId === categoryKey ? prev.statuses : {}),
              [result.id]: { state: "error", message: "Save failed. Try again." },
            },
          }));
        }
      }
    },
    [categoryKey, getValues, trigger]
  );

  const handleDirty = useCallback(
    (resultId: number) => {
      setStatusByCategory((prev) => ({
        categoryId: categoryKey,
        statuses: {
          ...(prev.categoryId === categoryKey ? prev.statuses : {}),
          [resultId]: { state: "dirty" },
        },
      }));
    },
    [categoryKey]
  );

  const hasUnsavedChanges = useMemo(
    () =>
      Object.values(statusById).some(
        (status) => status.state === "dirty" || status.state === "saving" || status.state === "error"
      ),
    [statusById]
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <FormProvider {...formMethods}>
      <legend>{label}</legend>
      {results.map((result) => {
        return (
          <Criterion
            key={result.id}
            result={result}
            status={statusById[result.id]}
            onAutoSave={handleAutoSave}
            onDirty={handleDirty}
          />
        );
      })}
    </FormProvider>
  );
}
