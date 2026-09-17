import { FloorPlanTarget } from '../../../utils/floorPlanTargets';
export default function FloorPlanTargetList({ title, targets, selectedKey, stagedKeys, sentinelRef, isFetching, isError, disabled, onSelect, onPress, }: {
    title: string;
    targets: FloorPlanTarget[];
    selectedKey: string | null;
    stagedKeys: Set<string>;
    sentinelRef: (node?: Element | null) => void;
    isFetching: boolean;
    isError: boolean;
    disabled: boolean;
    onSelect: (target: FloorPlanTarget) => void;
    onPress: (target: FloorPlanTarget) => void;
}): import("react").JSX.Element;
