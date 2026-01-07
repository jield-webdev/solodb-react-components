import { useQueries, UseQueryResult, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { listStatusOptions, StatusOption } from "@/modules/admin/functions/goldstein/listStatusOptions";
import { listGoldsteinEquipmentModules } from "@/modules/admin/functions/goldstein/listModules";
import { Module } from "@/modules/admin/functions/goldstein/listModules";
import { useGoldsteinClientDataContext } from "@/modules/admin/context/goldstein/DataContext";

// Create a client
const queryClient = new QueryClient();

// Wrapper component that provides QueryClientProvider
export default function UpdateStatusWrapper(props: {
  userID: number;
  equipmentID: number;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <UpdateStatus {...props} />
    </QueryClientProvider>
  );
}

function UpdateStatus({
  userID,
  equipmentID,
}: {
  userID: number;
  equipmentID: number;
}) {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [statusId, setStatusId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>("");
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { goldsteinData } = useGoldsteinClientDataContext();

  const queries = useQueries({
    queries: [
      {
        queryKey: ["status", "options"],
        queryFn: () => listStatusOptions(goldsteinData.goldsteinFQDN),
      },
      {
        queryKey: ["equipment", "modules", equipmentID],
        queryFn: () => listGoldsteinEquipmentModules(goldsteinData.goldsteinFQDN, equipmentID),
      },
    ],
  });

  const isLoading = queries.some((query: UseQueryResult) => query.isLoading);
  const dataAvailable = queries.every((query: UseQueryResult) => query.isSuccess);

  const [statusOptionsQuery, equipmentModulesQuery] = queries;

  // Set status options when available
  useEffect(() => {
    if (statusOptionsQuery.isSuccess) {
      setStatusOptions(statusOptionsQuery.data || []);
    }
  }, [statusOptionsQuery.isSuccess, statusOptionsQuery.data]);

  // Initialize module selection and form state
  useEffect(() => {
    if (dataAvailable && equipmentModulesQuery.data) {
      const modules = equipmentModulesQuery.data;

      // Reset if no modules available
      if (modules.length === 0) {
        setSelectedModuleId(null);
        setStatusId(null);
        setDescription("");
        return;
      }

      // Initialize with main tool module or first module
      const initialModule = modules.find((m: Module) => m.type.is_main_tool) || modules[0];
      setSelectedModuleId(initialModule.id);
      setStatusId(initialModule.latest_module_status?.status.id || null);
      setDescription(initialModule.latest_module_status?.description || "");
    }
  }, [dataAvailable, equipmentModulesQuery.data]);

  // Update form when selected module changes
  useEffect(() => {
    if (selectedModuleId && equipmentModulesQuery.data) {
      const module = equipmentModulesQuery.data.find((m: Module) => m.id === selectedModuleId);
      if (module) {
        setStatusId(module.latest_module_status?.status.id || null);
        setDescription(module.latest_module_status?.description || "");
      }
    }
  }, [selectedModuleId, equipmentModulesQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModuleId) {
      alert("Please select a module");
      return;
    }

    if (statusId === null) {
      alert("Please select a status");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(
        `https://${goldsteinData.goldsteinFQDN}/api/onelab/update/equipment/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userID,
            module: selectedModuleId,  // Updated to use selected module
            status: statusId,
            description: description,
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to update status: ${errorData.detail || res.statusText}`);
      } else {
        alert("Status updated successfully!");
      }
    } catch (error) {
      alert("Error updating status: " + error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-light-subtle">Update Status</div>
      <form onSubmit={handleSubmit} className="needs-validation p-3" noValidate>
        {/* Module Selection Dropdown */}
        <div className="mb-3">
          <label htmlFor="moduleSelect" className="form-label">
            Module
          </label>
          {isLoading ? (
            <div>Loading modules...</div>
          ) : equipmentModulesQuery.data?.length === 0 ? (
            <div>No modules available</div>
          ) : (
            <select
              className="form-select"
              id="moduleSelect"
              value={selectedModuleId || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedModuleId(Number(e.target.value))}
              required
              disabled={submitting}
            >
              {equipmentModulesQuery.data?.map((module: Module) => (
                <option key={module.id} value={module.id}>
                  {module.name} ({module.type.type})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Status Selection */}
        <div className="mb-3">
          <label htmlFor="statusSelect" className="form-label">
            Status
          </label>
          {isLoading ? (
            <div>Loading status options...</div>
          ) : (
            <select
              className="form-select"
              id="statusSelect"
              value={statusId ?? ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusId(Number(e.target.value))}
              required
              disabled={submitting || !selectedModuleId}
            >
              {statusOptions.map((option: StatusOption) => (
                <option
                  key={option.id}
                  value={option.id}
                  style={{
                    color: option.front_color,
                    backgroundColor: option.back_color,
                  }}
                >
                  {option.status}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description (optional)
          </label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add a description about the status update"
            disabled={submitting || !selectedModuleId}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || isLoading || !selectedModuleId}
        >
          {submitting ? "Updating..." : "Update Status"}
        </button>
      </form>
    </div>
  );
}
