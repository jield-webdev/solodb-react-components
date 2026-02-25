import React, { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import DateFormat from "@jield/solodb-react-components/modules/partial/dateFormat";
import ChecklistModal from "@jield/solodb-react-components/modules/run/components/step/view/element/checklist/checklistModal";
import { RunStepChecklistItem } from "@jield/solodb-typescript-core";

function ChecklistItemAction({
  checklistItem,
  onOpenModal,
  onMarkDone,
}: {
  checklistItem: RunStepChecklistItem;
  onOpenModal: () => void;
  onMarkDone: () => void;
}) {
  if (!checklistItem.can_finish) {
    return null;
  }

  if (checklistItem.description !== "") {
    return (
      <Button className={"float-end"} variant="primary" onClick={onOpenModal}>
        Execute checklist step
      </Button>
    );
  }

  return (
    <Button className={"float-end"} size={"sm"} variant="success" onClick={onMarkDone}>
      Done checklist step
    </Button>
  );
}

const ChecklistItemElement = ({
  checklistItem,
  refetch,
}: {
  checklistItem: RunStepChecklistItem;
  refetch: () => void;
}) => {
  const [modalShow, setModalShow] = useState(false);

  const setChecklistItemAsDone = async (): Promise<RunStepChecklistItem> => {
    const response = await axios.create().patch("update/run/step/checklist/done/" + checklistItem.id, {});

    return response.data;
  };

  const mutation = useMutation({
    mutationFn: setChecklistItemAsDone,
    onSuccess: (data) => {
      setModalShow(false);
      refetch();
    },
  });

  return (
    <ListGroup.Item disabled={checklistItem.is_executed} className={"d-flex justify-content-between align-items-start"}>
      <div className={"d-flex flex-column"}>
        {checklistItem.task}

        {checklistItem.is_executed && (
          <small>
            Executed on <DateFormat format="DD-MM-YYYY">{checklistItem.date_executed}</DateFormat>
          </small>
        )}
      </div>
      <div className={"flex-shrink-0"}>
        <ChecklistItemAction
          checklistItem={checklistItem}
          onOpenModal={() => setModalShow(true)}
          onMarkDone={() => mutation.mutate()}
        />
      </div>

      <ChecklistModal checklistItem={checklistItem} show={modalShow} setModalShow={setModalShow} mutation={mutation} />
    </ListGroup.Item>
  );
};

export default ChecklistItemElement;
