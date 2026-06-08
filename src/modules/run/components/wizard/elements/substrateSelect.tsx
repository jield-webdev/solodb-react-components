import { listSubstrate, type Substrate } from "@jield/solodb-typescript-core";
import { type Dispatch, type SetStateAction } from "react";
import AsyncSelect from "react-select/async";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";

type SubstrateOption = { value: number; label: string; substrate: Substrate };

type SubstrateSelectProps = {
  selectedSubstrate: Substrate | null;
  setSelectedSubstrate: Dispatch<SetStateAction<Substrate | null>>;
};

const isSubstrateOption = (option: unknown): option is SubstrateOption => {
  return (
    typeof option === "object" &&
    option !== null &&
    "value" in option &&
    typeof (option as { value?: unknown }).value === "number" &&
    "substrate" in option &&
    typeof (option as { substrate?: unknown }).substrate === "object" &&
    (option as { substrate?: unknown }).substrate !== null
  );
};

const substrateToOption = (substrate: Substrate): SubstrateOption => ({
  value: substrate.id,
  label: `${substrate.label} — ${substrate.short_label}`,
  substrate,
});

export default function SubstrateSelect({ selectedSubstrate, setSelectedSubstrate }: SubstrateSelectProps) {
  const loadOptions = async (inputValue: string): Promise<SubstrateOption[]> => {
    const response = await listSubstrate({ query: inputValue || undefined });
    return response.items.map(substrateToOption);
  };

  const currentOption: SubstrateOption | null = selectedSubstrate ? substrateToOption(selectedSubstrate) : null;

  return (
    <div className="mb-4">
      <h3>Select substrate</h3>
      <AsyncSelect
        isSearchable={true}
        isClearable={true}
        defaultOptions
        placeholder={"— Select a substrate, or start typing"}
        loadOptions={loadOptions}
        value={currentOption}
        styles={customStyles}
        onChange={(option) => {
          setSelectedSubstrate(isSubstrateOption(option) ? option.substrate : null);
        }}
      />
    </div>
  );
}
