export default function WaitingCardDetection () {
    return (
        <div className="text-center">
            <h1 className="display-4 mb-3">Waiting for card detection</h1>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
}
