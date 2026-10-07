import React, { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { useMutation } from "@tanstack/react-query";
import DateFormat from "@jield/solodb-react-components/modules/partial/dateFormat";
import ChecklistModal from "@jield/solodb-react-components/modules/run/components/step/view/element/checklist/checklistModal";
import { markChecklistItemDone, RunStepChecklistItem } from "@jield/solodb-typescript-core";

// `can_finish` is computed client-side: only the first pending item of a step can be executed.
export type ChecklistItem = RunStepChecklistItem & { can_finish: boolean };

export const withCanFinish = (items: RunStepChecklistItem[]): ChecklistItem[] => {
  const firstPendingIndex = items.findIndex((item) => !item.is_executed);
  return items.map((item, index) => ({ ...item, can_finish: index === firstPendingIndex }));
};

function ChecklistItemAction({
  checklistItem,
  onOpenModal,
  onMarkDone,
}: {
  checklistItem: ChecklistItem;
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

const ChecklistItemElement = ({ checklistItem, refetch }: { checklistItem: ChecklistItem; refetch: () => void }) => {
  const [modalShow, setModalShow] = useState(false);

  const mutation = useMutation({
    mutationFn: () => markChecklistItemDone({ checklistItem }),
    onSuccess: (data) => {
      setModalShow(false);
      refetch();
    },
  });

  return (
    <ListGroup.Item disabled={checklistItem.is_executed} className={"d-flex justify-content-between align-items-start"}>
      <div className={"d-flex flex-column"}>
        {checklistItem.task}

        {checklistItem.is_executed && checklistItem.date_executed && (
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
