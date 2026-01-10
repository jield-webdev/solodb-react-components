import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Category from "@jield/solodb-react-components/modules/service/components/report/Category";
import { getServiceEventReport, listReportResult, ServiceEventReport, ServiceEventReportResult } from "@jield/solodb-typescript-core";

export default function ReportResults() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [groupedReports, setGroupedReports] = useState<Record<string, ServiceEventReportResult[]>>();
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [categorySequences, setCategorySequences] = useState<Record<string, number>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);
  const [report, setReport] = useState<ServiceEventReport | null>(null);

  // Load data
  useEffect(() => {
    if (!id) return;

    // Fetch results
    listReportResult({ id: Number(id) }).then((data) => {
      const grouped = data.reduce(
        (acc: Record<string, ServiceEventReportResult[]>, item) => {
          const categoryObj = item.criterion_version.type.category;
          const key = String(categoryObj.id);
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        },
        {} as Record<string, ServiceEventReportResult[]>
      );

      // Build labels and sequences map
      const labels: Record<string, string> = {};
      const sequences: Record<string, number> = {};
      data.forEach((item) => {
        const c = item.criterion_version.type.category as any;
        const key = String(c.id);
        labels[key] = c.category;
        sequences[key] = typeof c.sequence === "number" ? c.sequence : Number.MAX_SAFE_INTEGER;
      });

      setGroupedReports(grouped);
      setCategoryLabels(labels);
      setCategorySequences(sequences);
    });

    // Fetch report meta (event details)
    getServiceEventReport({ id: Number(id) })
      .then((rep) => setReport(rep))
      .catch(() => setReport(null));
  }, [id]);

  const categories = useMemo(() => {
    if (!groupedReports) return [] as string[];
    return Object.keys(groupedReports).sort((a, b) => {
      const sa = categorySequences[a] ?? Number.MAX_SAFE_INTEGER;
      const sb = categorySequences[b] ?? Number.MAX_SAFE_INTEGER;
      if (sa !== sb) return sa - sb;
      return Number(a) - Number(b);
    });
  }, [groupedReports, categorySequences]);
  const totalCategories = categories.length;

  // When categories are available, initialize from URL (category param) or default to first
  useEffect(() => {
    if (!totalCategories) return;
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get("category");
    if (categoryFromUrl) {
      const idx = categories.indexOf(categoryFromUrl);
      if (idx !== -1) {
        setCurrentCategoryIndex(idx);
        return;
      }
    }
    // fallback to first category
    setCurrentCategoryIndex(0);
  }, [totalCategories, location.search, categories]);

  // Keep URL in sync when currentCategoryIndex changes
  useEffect(() => {
    if (!totalCategories) return;
    const currentCategory = categories[currentCategoryIndex];
    const params = new URLSearchParams(location.search);
    if (currentCategory) {
      if (params.get("category") !== currentCategory) {
        params.set("category", currentCategory);
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
      }
    }
  }, [currentCategoryIndex, totalCategories, categories, location.pathname, location.search, navigate]);

  if (!groupedReports) return <div>Loading…</div>;
  if (totalCategories === 0) return <div>No categories found</div>;

  const handlePrev = () => {
    setCurrentCategoryIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentCategoryIndex((prev) => Math.min(prev + 1, totalCategories - 1));
  };

  const event = report?.event;
  const serviceName = event?.service?.name;
  const placeName = event?.place?.name;
  const planned = event?.date_planned ? new Date(event.date_planned).toLocaleString() : undefined;
  const executed = event?.date_executed ? new Date(event.date_executed).toLocaleString() : undefined;

  return (
    <div className="container mt-4">
      {/* Header with event details */}
      {event && (
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h2 className="h4 mb-1">{serviceName || "Service"}</h2>
                <div className="text-muted small">
                  Report #{id} • Event #{event.id}
                  {event.guid ? ` • ${event.guid}` : ""}
                </div>
              </div>
            </div>
            <div className="row mt-2">
              {placeName && (
                <div className="col-md-4">
                  <div className="fw-semibold">Place</div>
                  <div>{placeName}</div>
                </div>
              )}
              {planned && (
                <div className="col-md-4">
                  <div className="fw-semibold">Planned</div>
                  <div>{planned}</div>
                </div>
              )}
              {executed && (
                <div className="col-md-4">
                  <div className="fw-semibold">Executed</div>
                  <div>{executed}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Category
        categoryId={categories[currentCategoryIndex]}
        label={categoryLabels[categories[currentCategoryIndex]]}
        results={groupedReports[categories[currentCategoryIndex]]}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-primary" onClick={handlePrev} disabled={currentCategoryIndex === 0}>
          Previous
        </button>

        <div className="text-center">
          Category {currentCategoryIndex + 1} of {totalCategories}
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={handleNext}
          disabled={currentCategoryIndex === totalCategories - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
