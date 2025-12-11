import Select, { MultiValue, StylesConfig } from "react-select";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

type Property = {
  value: string;
  label: string;
};

export default function EditSortingPropertiesModal({
  show,
  onClose,
  properties,
  blacklistedEquipmentProperties,
  setBlacklistedEquipmentProperties,
}: {
  show: boolean;
  onClose: () => void;
  properties: Property[];
  blacklistedEquipmentProperties: string[];
  setBlacklistedEquipmentProperties: React.Dispatch<React.SetStateAction<string[]>>; 
}) {
  const [selected, setSelected] = useState<MultiValue<Property>>([]);

  useEffect(() => {
    setSelected(properties.filter((prop) => !blacklistedEquipmentProperties.includes(prop.value))); 
  }, [properties]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlacklistedEquipmentProperties = properties.filter(((prop) => !selected.includes(prop))).map((item) => item.value); 
    setBlacklistedEquipmentProperties(newBlacklistedEquipmentProperties);  
    onClose();
  };

  const handleChange = (value: MultiValue<Property>) => {
    setSelected(value);
  };

  const isDarkMode = () =>
    document.documentElement.getAttribute("data-bs-theme") === "dark";

  const selectStyles: StylesConfig<Property, true> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode() ? "#212529" : provided.backgroundColor,
      borderColor: isDarkMode() ? "#495057" : provided.borderColor,
      color: isDarkMode() ? "#fff" : provided.color,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode() ? "#212529" : provided.backgroundColor,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: isDarkMode()
        ? state.isSelected
          ? "#0d6efd"
          : state.isFocused
          ? "#343a40"
          : "#212529"
        : provided.backgroundColor,
      color: isDarkMode() ? "#fff" : provided.color,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode() ? "#fff" : provided.color,
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode() ? "#343a40" : provided.backgroundColor,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDarkMode() ? "#fff" : provided.color,
    }),
    input: (provided) => ({
      ...provided,
      color: isDarkMode() ? "#fff" : provided.color,
    }),
  };

  return (
    <Modal show={show} size="lg" onHide={onClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit sorting properties</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="sorting-properties" className="mb-3">
            <Form.Label>Select properties to sort by</Form.Label>
            <Select<Property, true>
              isMulti
              classNamePrefix="react-select"
              placeholder="Select one or more properties"
              options={properties}
              value={selected}
              onChange={handleChange} 
              styles={selectStyles}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

