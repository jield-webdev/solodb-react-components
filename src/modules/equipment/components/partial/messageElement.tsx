import React, { JSX, useState } from "react";
import MessageModalForm from "@/modules/equipment/components/partial/messageModalForm";
import { Badge, Button } from "react-bootstrap";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import { LocationMessage } from "solodb-typescript-core";

export default function MessageElement({ message }: { message: LocationMessage }) {
  const [modalElement, setModalElement] = useState<JSX.Element | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message);

  // Function to reload the issue (simulate fetching updated data)
  const reloadMessage = (updatedMessage: LocationMessage) => {
    setCurrentMessage({
      ...currentMessage,
      ...updatedMessage,
    });
  };

  const handleShowModal = () => {
    setModalElement(
      <MessageModalForm
        showModal={true}
        onClose={(message: LocationMessage | undefined) => {
          setShowModal(false);
          if (message) {
            reloadMessage(message);
          }
        }}
        message={currentMessage}
      />
    );

    setShowModal(true);
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <Badge bg="dark">{currentMessage.type.type}</Badge>
          <h5 className="mb-0">{currentMessage.title}</h5>
        </div>
        <Button variant="secondary" size={"sm"} onClick={handleShowModal}>
          Edit
        </Button>
      </div>

      <div className="card-body">
        <ReactMarkdown>{currentMessage.description}</ReactMarkdown>
      </div>

      <div className="card-footer bg-transparent">
        <small className="text-muted d-flex flex-wrap gap-3">
          <span>Created: {moment(currentMessage.date_created).format("DD MMM YYYY")}</span>
          {currentMessage.last_update && (
            <span>Updated: {moment(currentMessage.last_update).format("DD MMM YYYY")}</span>
          )}
          {currentMessage.rooms.length > 0 && (
            <span>
              Rooms:{" "}
              {currentMessage.rooms.map((room, index) => (
                <React.Fragment key={room.id}>
                  {index > 0 && ", "}
                  {room.name}
                </React.Fragment>
              ))}
            </span>
          )}
          <span>Owner: {currentMessage.owner.full_name}</span>
        </small>
      </div>

      {showModal && modalElement}
    </div>
  );
}
