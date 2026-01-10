import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { Controller } from "react-hook-form";
import AsyncSelect from "react-select/async";
import { customStyles } from "@/modules/core/form/element/userFormElement";
import { listChemicalContainerMethodsOfUse } from "@jield/solodb-typescript-core";

export default function ChemicalContainerMethodOfUseSelectFormElement({
  control,
  errors,
}: {
  control: any;
  errors: any;
}) {
  const [optionsCache, setOptionsCache] = useState<Record<string, { value: number; label: string }>>({});

  const loadOptions = (inputValue: string, callback: any) => {
    try {
      const response = listChemicalContainerMethodsOfUse({
        query: inputValue,
      });
      response.then((response) => {
        const options = response.items.map((methodOfUse) => ({
          value: methodOfUse.id,
          label: methodOfUse.name,
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
      console.error("Error fetching methods of use:", e);
    }
  };

  const getCurrentOption = (value: number) => {
    // Check if current value is cached; return it or null
    return optionsCache[value] || null;
  };

  return (
    <InputGroup hasValidation className={"mb-3 row"}>
      <Form.Label>Method of use</Form.Label>
      <Controller
        name="method_of_use"
        control={control}
        render={({ field }) => (
          <AsyncSelect
            isSearchable={true}
            defaultOptions
            placeholder={"— Select a method of use"}
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
      {errors.method_of_use && <span className={"text-danger"}>{errors.method_of_use.message}</span>}
    </InputGroup>
  );
}
