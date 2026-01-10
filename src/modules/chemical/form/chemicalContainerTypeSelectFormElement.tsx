import React, { useState } from "react";
import { Controller } from "react-hook-form";
import AsyncSelect from "react-select/async";
import { customStyles } from "@/modules/core/form/element/userFormElement";
import { listChemicalContainerTypes } from "@jield/solodb-typescript-core";

export default function ChemicalContainerTypeSelectFormElement({ control, errors }: { control: any; errors: any }) {
  const [optionsCache, setOptionsCache] = useState<Record<string, { value: number; label: string }>>({});

  const loadOptions = (inputValue: string, callback: any) => {
    try {
      const response = listChemicalContainerTypes({ query: inputValue });
      response.then((response) => {
        const options = response.items.map((containerType) => ({
          value: containerType.id,
          label: containerType.name,
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
      console.error("Error fetching types:", e);
    }
  };

  const getCurrentOption = (value: number) => {
    // Check if current value is cached; return it or null
    return optionsCache[value] || null;
  };

  return (
    <Controller
      name="container_type"
      control={control}
      render={({ field }) => (
        <AsyncSelect
          isSearchable={true}
          defaultOptions
          placeholder={"— Select a container type"}
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
  );
}
