import { useRef, useState, type ReactNode } from "react";
import { Overlay } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import {
  performRunStepPartActions,
  RunStep,
  RunStepPart,
  RunStepPartActionEnum,
  RunStepPartStateEnum,
} from "@jield/solodb-typescript-core";
import { updateRunStepPartCacheByRunStep } from "@jield/solodb-react-components/modules/run/utils/runStepPartCache";
import { PartActionsButtons } from "@jield/solodb-react-components/modules/run/components/shared/parts_table/element/partActionsButtons";

/**
 * Wraps a tray's parts and exposes a hover overlay with the actions that can be
 * applied in bulk to every part in the tray.
 */
export const TrayBulkActions = ({
  label,
  trayStepParts,
  runStep,
  children,
}: {
  label: string;
  trayStepParts: RunStepPart[];
  runStep: RunStep;
  children: ReactNode;
}) => {
  const queryClient = useQueryClient();
  const target = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [show, setShow] = useState(false);

  const open = () => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setShow(true);
  };

  const scheduleHide = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShow(false), 150);
  };

  const availableActions = (() => {
    const seen = new Map<RunStepPartActionEnum, string>();
    for (const sp of trayStepParts) {
      for (const { id, name } of sp.available_actions) {
        if (!seen.has(id)) seen.set(id, name);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  })();

  const performAction = async (action: RunStepPartActionEnum) => {
    const actionable = trayStepParts.filter((sp) => sp.available_actions.some(({ id }) => id === action));
    if (actionable.length === 0) return;
    const latestActions = await performRunStepPartActions({
      runStepPartActions: actionable.map((runStepPart) => ({
        runStepPart,
        // NOTE: core library currently types this as `RunStepPartStateEnum` even though
        // `available_actions` entries are `RunStepPartActionEnum`. Cast is safe until the
        // core typing is corrected.
        runStepPartAction: action as unknown as RunStepPartStateEnum,
      })),
    });
    updateRunStepPartCacheByRunStep(queryClient, runStep, { latestActions });
  };

  return (
    <div ref={target} className="tray-grid-wrapper" onMouseEnter={open} onMouseLeave={scheduleHide}>
      <div className="tray-grid__label">{label}</div>
      {children}
      {availableActions.length > 0 && (
        <Overlay target={target.current} show={show} placement="top">
          {({
            placement: _placement,
            arrowProps: _arrowProps,
            show: _show,
            popper: _popper,
            hasDoneInitialMeasure: _hasDoneInitialMeasure,
            ...props
          }) => (
            <div
              {...props}
              onMouseEnter={open}
              onMouseLeave={scheduleHide}
              style={{
                position: "absolute",
                backgroundColor: "rgba(33, 37, 41, 0.95)",
                padding: "12px 16px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
                ...props.style,
              }}
            >
              <PartActionsButtons availableActions={availableActions} onActionSelected={performAction} />
            </div>
          )}
        </Overlay>
      )}
    </div>
  );
};
