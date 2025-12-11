import { LocationMessage } from "@/modules/location/interfaces/locationMessage";
import MessageElement from "@/modules/equipment/components/partial/messageElement";
import MessageModalForm from "@/modules/equipment/components/partial/messageModalForm";
import { JSX, useState } from "react";
import { Button } from "react-bootstrap";

export default function StatusMailMessageElement({
  messageList,
  refetchFn,
}: {
  messageList: LocationMessage[];
  refetchFn: () => void;
}) {
  const [modalElement, setModalElement] = useState<JSX.Element | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setModalElement(
      <MessageModalForm
        showModal={true}
        onClose={(message: LocationMessage | undefined) => {
          setShowModal(false);
          refetchFn();
        }}
      />
    );

    setShowModal(true);
  };

  return (
    <>
      <div className="d-flex gap-3">
        <h2>Messages</h2>
        <div>
          <Button variant="secondary" onClick={handleShowModal}>
            New message
          </Button>
        </div>
      </div>
      {messageList.map((message, index) => (
        <div key={message.id}>
          <MessageElement message={message} />
        </div>
      ))}

      {showModal && modalElement}
    </>
  );
}
