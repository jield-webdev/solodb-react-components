import { listSubstrate, type Substrate } from "@jield/solodb-typescript-core";
import { type Dispatch, type SetStateAction } from "react";
import { Button, Form } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";

export type SelectedSubstrate = { substrate: Substrate; amount: number };

type SubstrateOption = { value: number; label: string; substrate: Substrate };

type SubstrateSelectProps = {
  selectedSubstrates: SelectedSubstrate[];
  setSelectedSubstrates: Dispatch<SetStateAction<SelectedSubstrate[]>>;
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

export default function SubstrateSelect({ selectedSubstrates, setSelectedSubstrates }: SubstrateSelectProps) {
  const loadOptions = async (inputValue: string): Promise<SubstrateOption[]> => {
    const response = await listSubstrate({ query: inputValue || undefined });
    return response.items.map(substrateToOption);
  };

  const addSubstrate = (substrate: Substrate) => {
    setSelectedSubstrates((current) => {
      if (current.some((entry) => entry.substrate.id === substrate.id)) {
        return current;
      }
      return [...current, { substrate, amount: 1 }];
    });
  };

  const updateAmount = (substrateId: number, amount: number) => {
    setSelectedSubstrates((current) =>
      current.map((entry) => (entry.substrate.id === substrateId ? { ...entry, amount } : entry)),
    );
  };

  const removeSubstrate = (substrateId: number) => {
    setSelectedSubstrates((current) => current.filter((entry) => entry.substrate.id !== substrateId));
  };

  return (
    <div className="mb-4">
      <h3>Select substrate</h3>
      <AsyncSelect
        isSearchable={true}
        isClearable={true}
        defaultOptions
        placeholder={"— Select a substrate, or start typing"}
        loadOptions={loadOptions}
        value={null}
        styles={customStyles}
        onChange={(option) => {
          if (isSubstrateOption(option)) {
            addSubstrate(option.substrate);
          }
        }}
      />

      {selectedSubstrates.length > 0 && (
        <div className="d-flex flex-column gap-2 mt-3">
          {selectedSubstrates.map(({ substrate, amount }) => (
            <div key={substrate.id} className="d-flex flex-column gap-2 bg-body-secondary rounded p-2">
              <div className="fw-semibold">
                {substrate.label} — {substrate.short_label}
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeSubstrate(substrate.id)}
                  aria-label={`Deselect ${substrate.label}`}
                >
                    Deselect 
                </Button>
                <Form.Control
                  type="number"
                  min={0}
                  step={1}
                  value={amount}
                  className="flex-grow-1"
                  onChange={(event) => {
                    const nextAmount = Number(event.target.value);
                    updateAmount(substrate.id, Number.isFinite(nextAmount) ? Math.max(0, nextAmount) : 0);
                  }}
                  aria-label={`Amount for ${substrate.label}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
