interface UserNotAuthorizedProps {
  userName: string;
  badgeUUID: string; 
}

export default function UserNotAuthorized ({ userName, badgeUUID }: UserNotAuthorizedProps) {
    return (
        <div className="text-center">
            <div className="alert alert-danger mb-4" role="alert">
                <h1 className="h4 alert-heading">This user cannot use the equipment</h1>
                <hr />
                <p className="mb-0">Access denied due to insufficient permissions</p>
            </div>
            <div className="card mb-3">
                <div className="card-header bg-light-sublte">User Information</div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>User:</span>
                        <span className="badge bg-secondary">{userName}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Badge UUID:</span>
                        <code>{badgeUUID}</code>
                    </li>
                </ul>
            </div>
        </div>
    );
}
