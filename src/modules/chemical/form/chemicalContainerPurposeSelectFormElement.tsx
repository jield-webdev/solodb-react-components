import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { Controller } from "react-hook-form";
import AsyncSelect from "react-select/async";
import { customStyles } from "@jield/solodb-react-components/modules/core/form/element/userFormElement";
import { listChemicalContainerPurposes } from "@jield/solodb-typescript-core";

export default function ChemicalContainerPurposeSelectFormElement({ control, errors }: { control: any; errors: any }) {
  const [optionsCache, setOptionsCache] = useState<Record<string, { value: number; label: string }>>({});

  const loadOptions = (inputValue: string, callback: any) => {
    try {
      const response = listChemicalContainerPurposes({
        query: inputValue,
      });
      response.then((response) => {
        const options = response.items.map((purpose) => ({
          value: purpose.id,
          label: purpose.name,
        }));

        // Cache the options for future reference
        const cachedOptions = { ...optionsCache };
        options.forEach((option) => {
          cachedOptions[option.value] = option;
        });
        setOptionsCache(cachedOptions);

        // Provide the options to the callback for AsyncSelect
        callback(options);
      });
    } catch (e) {
      console.error("Error fetching purposes:", e);
    }
  };

  const getCurrentOption = (value: number) => {
    // Check if current value is cached; return it or null
    return optionsCache[value] || null;
  };

  return (
    <InputGroup hasValidation className={"mb-3 row"}>
      <Form.Label>Purpose</Form.Label>
      <Controller
        name="purpose"
        control={control}
        render={({ field }) => (
          <AsyncSelect
            isSearchable={true}
            defaultOptions
            placeholder={"— Select a purpose"}
            loadOptions={loadOptions}
            value={getCurrentOption(field.value)}
            onChange={(e: any) => {
              // Pass only the value (number) to the field
              field.onChange(e?.value);
            }}
            styles={customStyles}
          />
        )}
      />
      {errors.purpose && <span className={"text-danger"}>{errors.purpose.message}</span>}
    </InputGroup>
  );
}
