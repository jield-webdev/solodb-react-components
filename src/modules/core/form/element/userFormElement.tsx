import React from "react";
import listUsers from "solodb-typescript-core";
import AsyncSelect from "react-select/async";
import { Controller } from "react-hook-form";
import { Form } from "react-bootstrap";
import { StylesConfig } from "react-select";

// Function to check if dark mode is active
const isDarkMode = () => {
  return document.documentElement.getAttribute('data-bs-theme') === 'dark';
};

export const customStyles: StylesConfig = {
  control: (base: any) => ({
    ...base,
    backgroundColor: isDarkMode() ? '#212529' : '#ffffff', // Dark/Light background color for the input
    color: isDarkMode() ? '#fff' : '#000000', // White/Black text
    borderColor: isDarkMode() ? '#495057' : '#cccccc', // Dark/Light gray border
    boxShadow: "none", // Avoid dark shadow styles
    "&:hover": {
      borderColor: isDarkMode() ? '#6c757d' : '#aaaaaa', // Darker gray on hover
    },
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: isDarkMode() ? '#212529' : '#ffffff', // Dark/Light background for the dropdown menu
    color: isDarkMode() ? '#fff' : '#000000', // White/Black text for the dropdown
  }),
  option: (base: any, state: { isSelected: any; isFocused: any }) => ({
    ...base,
    backgroundColor: isDarkMode()
      ? state.isSelected
        ? '#0d6efd' // Blue for selected item in dark mode
        : state.isFocused
          ? '#343a40' // Dark gray for hover in dark mode
          : '#212529' // Default dark background for options
      : state.isSelected
        ? '#e6f7ff' // Light blue for selected item in light mode
        : state.isFocused
          ? '#f5f5f5' // Light gray for hover in light mode
          : '#ffffff', // Default light background for options
    color: isDarkMode() ? '#fff' : '#000000', // White/Black text for options
  }),
  singleValue: (base: any) => ({
    ...base,
    color: isDarkMode() ? '#fff' : '#000000', // White/Black text for selected value
  }),
  placeholder: (base: any) => ({
    ...base,
    color: isDarkMode() ? '#6c757d' : '#aaaaaa', // Dark/Light gray placeholder text
  }),
  input: (base: any) => ({
    ...base,
    color: isDarkMode() ? '#fff' : '#000000', // White/Black text for input
  }),
};

const UserFormElement = ({ control, name }: { control: any; name: string }) => {
  // Create a promise for options to populate the dropdown
  const promiseOptions = (inputValue: string) =>
    listUsers({ query: inputValue }).then((users) => {
      return users.items.map((user) => {
        return {
          value: user.id,
          label: `${user.full_name} (${user.email})`,
        };
      });
    });

  // Custom validator
  const validateField = (value: any) => {
    return true; // Valid field
  };

  // Custom styles to enforce light colors

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div>
          <AsyncSelect
            {...field}
            defaultValue={field.value?.id}
            defaultInputValue={field.value?.full_name}
            isClearable
            placeholder={"— select a user"}
            className={"w-100"}
            defaultOptions
            loadOptions={promiseOptions}
            styles={customStyles}
          />
          {/* Display validation error */}
          {fieldState.error && (
            <Form.Control.Feedback type="invalid">
              {fieldState.error.message || "This field is required"}
            </Form.Control.Feedback>
          )}
        </div>
      )}
    />
  );
};

export default UserFormElement;
