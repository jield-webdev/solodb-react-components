import { listSubstrate, type Substrate } from "@jield/solodb-typescript-core";
import { type Dispatch, type SetStateAction } from "react";
import { Button, Form } from "react-bootstrap";
import { type StylesConfig } from "react-select";
import AsyncSelect from "react-select/async";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";

export type SelectedSubstrate = { substrate: Substrate; amount: number };

type SubstrateOption = { value: number; label: string; substrate: Substrate };

type SubstrateSelectProps = {
  selectedSubstrates: SelectedSubstrate[];
  setSelectedSubstrates: Dispatch<SetStateAction<SelectedSubstrate[]>>;
};

const substrateToOption = (substrate: Substrate): SubstrateOption => ({
  value: substrate.id,
  label: `${substrate.label} — ${substrate.short_label}`,
  substrate,
});

const loadOptions = async (inputValue: string): Promise<SubstrateOption[]> => {
  const response = await listSubstrate({ query: inputValue || undefined });
  return response.items.map(substrateToOption);
};

// customStyles is option-type agnostic, so narrowing it to SubstrateOption is safe.
const substrateSelectStyles = customStyles as StylesConfig<SubstrateOption, false>;

export default function SubstrateSelect({ selectedSubstrates, setSelectedSubstrates }: SubstrateSelectProps) {
  const addSubstrate = (substrate: Substrate) => {
    setSelectedSubstrates((current) => {
      if (current.some((entry) => entry.substrate.id === substrate.id)) {
        return current;
      }
      return [...current, { substrate, amount: 1 }];
    });
  };

  const updateAmount = (substrateId: number, amount: number) => {
    const sanitizedAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
    setSelectedSubstrates((current) =>
      current.map((entry) => (entry.substrate.id === substrateId ? { ...entry, amount: sanitizedAmount } : entry))
    );
  };

  const removeSubstrate = (substrateId: number) => {
    setSelectedSubstrates((current) => current.filter((entry) => entry.substrate.id !== substrateId));
  };

  return (
    <div className="mb-4">
      <h3>Select substrate</h3>
      <AsyncSelect<SubstrateOption>
        isSearchable={true}
        isClearable={true}
        defaultOptions
        placeholder={"— Select a substrate, or start typing"}
        loadOptions={loadOptions}
        value={null}
        styles={substrateSelectStyles}
        onChange={(option) => {
          if (option) {
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
                  onChange={(event) => updateAmount(substrate.id, Number(event.target.value))}
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
