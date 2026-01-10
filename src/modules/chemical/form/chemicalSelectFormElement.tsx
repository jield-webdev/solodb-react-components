import React, { useState } from "react";
import { Button, Form, Row } from "react-bootstrap";
import { Controller } from "react-hook-form";
import AsyncSelect from "react-select/async";
import axios from "axios";
import CreateChemicalModal from "@/modules/chemical/components/modal/createChemicalModal";
import { customStyles } from "@/modules/core/form/element/userFormElement";
import { Chemical, listChemicals } from "@jield/solodb-typescript-core";

type Inputs = Omit<Chemical, "id">;

export default function ChemicalSelectFormElement({
  control,
  name,
  setValue,
  errors,
}: {
  control: any;
  name: string;
  setValue: any;
  errors: any;
}) {
  const [optionsCache, setOptionsCache] = useState<Record<string, { value: number; label: string }>>({});
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [newChemical, setNewChemical] = useState<{
    value: number;
    label: string;
  } | null>(null);

  const loadOptions = (inputValue: string, callback: any) => {
    try {
      const response = listChemicals({ query: inputValue });
      response.then((response) => {
        const options = response.items.map((chemical) => ({
          value: chemical.id,
          label: chemical.name + (chemical.cas_number ? " (" + chemical.cas_number + ")" : ""),
        }));

        const cachedOptions = { ...optionsCache };
        options.forEach((option) => {
          cachedOptions[option.value] = option;
        });
        setOptionsCache(cachedOptions);

        callback(options);
      });
    } catch (e) {
      console.error("Error fetching chemicals:", e);
    }
  };

  const getCurrentOption = (value: number) => {
    if (value && optionsCache[value]) {
      return optionsCache[value];
    }
    return newChemical || null; // Handle selecting the new chemical
  };

  const handleCreateChemical = async (chemicalData: Inputs) => {
    try {
      const response = await axios.post<Chemical>("create/chemical", chemicalData);
      const option = {
        value: response.data.id,
        label: response.data.name + (response.data.cas_number ? ` (${response.data.cas_number})` : ""),
      };

      setOptionsCache((prev) => ({ ...prev, [option.value]: option }));
      setNewChemical(option); // Set as the newly created chemical
      setShowModal(false); // Close the modal

      setValue(name, response.data.id); // Set the value in the form
    } catch (e) {
      console.error("Error creating chemical:", e);
    }
  };

  return (
    <>
      <Form.Group className={"mb-3"}>
        <Form.Label>Search Existing Chemicals</Form.Label>
        <Row>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <AsyncSelect
                isSearchable={true}
                isClearable={true}
                defaultOptions
                placeholder={"— Select a chemical, or start typing"}
                loadOptions={loadOptions}
                value={getCurrentOption(field.value)}
                styles={customStyles}
                onChange={(e: any) => {
                  setNewChemical(null); // Reset newChemical state when changing selection
                  field.onChange(e?.value);
                }}
              />
            )}
          />
          {errors.chemical && <Form.Control.Feedback type="invalid">{errors.chemical.message}</Form.Control.Feedback>}
          <div>
            <Button variant="primary" className="mt-2" onClick={() => setShowModal(true)}>
              Create New Chemical
            </Button>
          </div>
        </Row>
      </Form.Group>
      <CreateChemicalModal show={showModal} setShow={setShowModal} onChemicalCreate={handleCreateChemical} />
    </>
  );
}
