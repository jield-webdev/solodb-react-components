export default function ServerError() {
    return (
        <div className="text-center">
            <div className="alert alert-danger mb-4" role="alert">
                <h1 className="h4 alert-heading">Server Error</h1>
                <hr />
                <p className="mb-0">Unable to connect to the server. Please check your connection and try again.</p>
            </div>
            <div className="d-grid gap-2 col-6 mx-auto">
                <button className="btn btn-outline-secondary" type="button" onClick={() => window.location.reload()}>
                    Refresh Page
                </button>
            </div>
        </div>
    );
}
