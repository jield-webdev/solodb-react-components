type OrganisationOption = {
    id: number;
    label: string;
};
type OrganisationSelectProps = {
    controlId: string;
    /** Capitalized singular entity name, e.g. "Group". */
    label: string;
    options: OrganisationOption[];
    isLoading: boolean;
    value: number | null;
    onChange: (id: number | null) => void;
    showError: boolean;
    disabled: boolean;
    helpText: string;
};
export default function OrganisationSelect({ controlId, label, options, isLoading, value, onChange, showError, disabled, helpText, }: OrganisationSelectProps): import("react").JSX.Element;
export {};
