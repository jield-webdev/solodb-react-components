import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Chemical, ChemicalStandardProductEnum, ChemicalPhysicalStateEnum } from "@jield/solodb-typescript-core";
import ChemicalSelectFormElement from "./chemicalSelectFormElement";

const listChemicalsMock = vi.hoisted(() => vi.fn());

vi.mock("@jield/solodb-typescript-core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@jield/solodb-typescript-core")>();
  return {
    ...original,
    listChemicals: listChemicalsMock,
  };
});

vi.mock("@jield/solodb-react-components/modules/chemical/components/modal/createChemicalModal", () => ({
  default: () => null,
}));

const makeChemical = (overrides: Partial<Chemical>): Chemical => ({
  id: 1,
  name: "Acetone",
  cas_number: "67-64-1",
  chemical_formula: "C3H6O",
  ehs_link: null,
  cmr: ["H225", "H319"],
  description: null,
  is_standard_product: true,
  standard_product: ChemicalStandardProductEnum.STANDARD_PRODUCT,
  physical_state: ChemicalPhysicalStateEnum.LIQUID,
  is_halogenated: false,
  contains_metals: false,
  main_chemical: null,
  safety_statement: [],
  safety_icons: [],
  ...overrides,
});

function ChemicalSelectHarness() {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{ chemical?: number }>();

  return (
    <>
      <ChemicalSelectFormElement control={control} name="chemical" setValue={setValue} errors={errors} />
      <output aria-label="Selected chemical id">{watch("chemical")}</output>
    </>
  );
}

describe("ChemicalSelectFormElement", () => {
  beforeEach(() => {
    listChemicalsMock.mockReset();
    listChemicalsMock.mockResolvedValue({
      items: [
        makeChemical({}),
        makeChemical({
          id: 2,
          name: "Water",
          cas_number: "7732-18-5",
          chemical_formula: "H2O",
          cmr: [],
          is_standard_product: false,
          standard_product: ChemicalStandardProductEnum.NON_STANDARD_PRODUCT,
        }),
      ],
      amountOfPages: 1,
      currentPage: 1,
      totalItems: 2,
      hasMore: false,
    });
  });

  it("shows chemical details and an explicit selection action", async () => {
    render(<ChemicalSelectHarness />);

    const acetoneRow = (await screen.findByText("Acetone")).closest("tr");
    expect(acetoneRow).not.toBeNull();
    expect(within(acetoneRow!).getByText("67-64-1")).toBeInTheDocument();
    expect(within(acetoneRow!).getByText("C3H6O")).toBeInTheDocument();
    expect(within(acetoneRow!).getByText("H225, H319")).toBeInTheDocument();
    expect(within(acetoneRow!).getByText("Yes")).toBeInTheDocument();
    expect(within(acetoneRow!).getByRole("button", { name: "Select Acetone" })).toBeInTheDocument();
  });

  it("selects a chemical from either its button or table row", async () => {
    const user = userEvent.setup();
    render(<ChemicalSelectHarness />);

    await user.click(await screen.findByRole("button", { name: "Select Acetone" }));
    expect(screen.getByLabelText("Selected chemical id")).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Selected Acetone" })).toBeDisabled();

    const waterRow = screen.getByText("Water").closest("tr");
    expect(waterRow).not.toBeNull();
    await user.click(waterRow!);

    expect(screen.getByLabelText("Selected chemical id")).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "Selected Water" })).toBeDisabled();
  });
});
