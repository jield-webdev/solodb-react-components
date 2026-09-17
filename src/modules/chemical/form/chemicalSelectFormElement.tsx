import React, { useEffect, useId, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { Controller } from "react-hook-form";
import CreateChemicalModal from "@jield/solodb-react-components/modules/chemical/components/modal/createChemicalModal";
import { Chemical, ChemicalStandardProductEnum, listChemicals } from "@jield/solodb-typescript-core";

const EMPTY_VALUE = "—";

const isStandardProduct = (chemical: Chemical) =>
  chemical.is_standard_product || chemical.standard_product === ChemicalStandardProductEnum.STANDARD_PRODUCT;

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
  const searchInputId = useId();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setLoadError(null);

    const timeoutId = window.setTimeout(
      async () => {
        try {
          const response = await listChemicals({ query: query.trim() });
          if (isActive) {
            setChemicals(response.items);
          }
        } catch (error) {
          console.error("Error fetching chemicals:", error);
          if (isActive) {
            setChemicals([]);
            setLoadError("Chemicals could not be loaded. Please try again.");
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      },
      query ? 250 : 0
    );

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const handleCreateChemical = (chemical: Chemical) => {
    setChemicals((currentChemicals) => [
      chemical,
      ...currentChemicals.filter((currentChemical) => currentChemical.id !== chemical.id),
    ]);
    setShowModal(false);
    setValue(name, chemical.id, { shouldDirty: true, shouldValidate: true });
  };

  const errorMessage = errors?.[name]?.message ?? errors?.chemical?.message;

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label htmlFor={searchInputId}>Search existing chemicals</Form.Label>
        <Form.Control
          id={searchInputId}
          type="search"
          value={query}
          placeholder="Search by name or CAS number"
          onChange={(event) => setQuery(event.target.value)}
          className="mb-2"
        />

        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="table-responsive border rounded">
              <Table hover size="sm" className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Chemical</th>
                    <th scope="col">CAS number</th>
                    <th scope="col">Formula</th>
                    <th scope="col">CRMH</th>
                    <th scope="col">Standard product</th>
                    <th scope="col" className="text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-muted">
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                        Loading chemicals…
                      </td>
                    </tr>
                  )}

                  {!isLoading && loadError && (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-danger">
                        {loadError}
                      </td>
                    </tr>
                  )}

                  {!isLoading && !loadError && chemicals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-muted">
                        No chemicals found.
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    !loadError &&
                    chemicals.map((chemical) => {
                      const isSelected = Number(field.value) === chemical.id;

                      return (
                        <tr
                          key={chemical.id}
                          className={isSelected ? "table-primary" : undefined}
                          style={{ cursor: "pointer" }}
                          aria-selected={isSelected}
                          onClick={() => field.onChange(chemical.id)}
                        >
                          <td className="fw-semibold">{chemical.name}</td>
                          <td>{chemical.cas_number || EMPTY_VALUE}</td>
                          <td>{chemical.chemical_formula || EMPTY_VALUE}</td>
                          <td>{chemical.cmr.length > 0 ? chemical.cmr.join(", ") : EMPTY_VALUE}</td>
                          <td>{isStandardProduct(chemical) ? "Yes" : "No"}</td>
                          <td className="text-end">
                            <Button
                              type="button"
                              size="sm"
                              variant={isSelected ? "success" : "outline-primary"}
                              disabled={isSelected}
                              aria-label={`${isSelected ? "Selected" : "Select"} ${chemical.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                field.onChange(chemical.id);
                              }}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>
            </div>
          )}
        />

        {errorMessage && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {String(errorMessage)}
          </Form.Control.Feedback>
        )}

        <Button type="button" variant="primary" className="mt-2" onClick={() => setShowModal(true)}>
          Create New Chemical
        </Button>
      </Form.Group>

      <CreateChemicalModal show={showModal} setShow={setShowModal} onChemicalCreate={handleCreateChemical} />
    </>
  );
}
