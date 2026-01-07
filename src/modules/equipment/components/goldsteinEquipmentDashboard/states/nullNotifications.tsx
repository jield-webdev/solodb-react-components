export default function NullNotifications() {
    return (
        <div className="text-center mt-5">
            <div className="alert alert-secondary border rounded-3 shadow-sm p-4 mx-auto" style={{ maxWidth: "600px" }} role="alert">
                <h2 className="h5 text-muted mb-3">No Notifications Found</h2>
                <p className="text-secondary mb-0">
                    There are currently no Goldstein clients available for this association, or the service might be temporarily down.
                </p>
            </div>
            <div className="d-grid gap-2 col-6 mx-auto mt-3">
                <button
                    className="btn btn-outline-primary btn-sm"
                    type="button"
                    onClick={() => window.location.reload()}
                >
                    Refresh Page
                </button>
            </div>
        </div>
    );
}

