import React, { useState } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Location, Room, User } from "@jield/solodb-typescript-core";
import { AuthContext } from "../../../core/contexts/authContext";
import RegisterContainerElement from "./registerContainerElement";
import RegisterBarcodeElement from "./registerBarcodeElement";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  createExternalLabel: vi.fn(),
  listExternalLabels: vi.fn(),
  getLocation: vi.fn(),
  addCallbackFn: vi.fn(),
  removeCallbackFn: vi.fn(),
}));

vi.mock("@jield/solodb-typescript-core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@jield/solodb-typescript-core")>()),
  createChemicalContainer: mocks.create,
  createChemicalContainerExternalLabel: mocks.createExternalLabel,
  listChemicalContainerExternalLabels: mocks.listExternalLabels,
  getLocation: mocks.getLocation,
}));
vi.mock("react-router-dom", () => ({ useParams: () => ({ environment: "test" }) }));
vi.mock("../../../core/contexts/scannerContext", () => ({ useScannerContext: () => mocks }));
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value, onClick }: { value: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {value}
    </button>
  ),
}));
vi.mock("../../form/locationSelectFormElement", async () => {
  const { Controller } = await import("react-hook-form");
  return {
    default: ({ control, name }: React.ComponentProps<typeof Controller>) => (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <select aria-label="Location" {...field}>
            <option value="0">Select location</option>
            <option value="1">Shelf one</option>
            <option value="2">Shelf two</option>
          </select>
        )}
      />
    ),
  };
});
vi.mock("../../form/chemicalSelectFormElement", () => ({
  default: ({ name, onChange, onBlur, ref }: React.ComponentProps<"input">) => (
    <input aria-label="Chemical" name={name} onChange={onChange} onBlur={onBlur} ref={ref} />
  ),
}));
vi.mock("../../form/chemicalContainerTypeSelectFormElement", () => ({
  default: ({ name, onChange, onBlur, ref }: React.ComponentProps<"input">) => (
    <input aria-label="Container type" name={name} onChange={onChange} onBlur={onBlur} ref={ref} />
  ),
}));
vi.mock("../../../core/form/element/userFormElement", () => ({ default: () => null }));

const shelfOne = { id: 1, name: "Shelf one" } as Location;
const shelfTwo = { id: 2, name: "Shelf two" } as Location;

function RegistrationHarness({
  initialLocation = null,
  barcodeRegistration,
}: {
  initialLocation?: Location | null;
  barcodeRegistration: boolean;
}) {
  const [location, setLocation] = useState(initialLocation);
  return (
    <AuthContext.Provider
      value={{ user: { id: 3, full_name: "Owner" } as User, setUser: vi.fn(), isLoadingUser: false }}
    >
      <button onClick={() => setLocation(shelfTwo)}>Change prop</button>
      <button onClick={() => setLocation(null)}>Clear prop</button>
      {barcodeRegistration ? (
        <RegisterBarcodeElement
          room={{ id: 1 } as Room}
          barcode="external-barcode"
          location={location}
          setLocation={setLocation}
          resetForm={vi.fn()}
        />
      ) : (
        <RegisterContainerElement
          room={{ id: 1 } as Room}
          location={location}
          setLocation={setLocation}
          resetForm={vi.fn()}
        />
      )}
    </AuthContext.Provider>
  );
}

async function submitContainer() {
  fireEvent.change(screen.getByLabelText("Chemical"), { target: { value: "4" } });
  const containerType = screen.queryByLabelText("Container type");
  if (containerType) fireEvent.change(containerType, { target: { value: "5" } });
  fireEvent.change(document.querySelector('input[name="concentration"]')!, { target: { value: "10" } });
  fireEvent.change(document.querySelector('input[name="amount"]')!, { target: { value: "20" } });
  fireEvent.click(screen.getByRole("button", { name: "Register container" }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalled());
}

function scan(keys: string) {
  const callback = mocks.addCallbackFn.mock.calls.at(-1)![2] as (keys: string) => void;
  act(() => callback(keys));
}

describe.each(["container", "barcode"] as const)("Chemical %s registration location", (registration) => {
  function Harness(props: { initialLocation?: Location | null }) {
    return <RegistrationHarness {...props} barcodeRegistration={registration === "barcode"} />;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue({ id: 10 });
    mocks.createExternalLabel.mockResolvedValue({ id: 20 });
    mocks.listExternalLabels.mockResolvedValue({ items: [] });
    mocks.getLocation.mockImplementation(({ id }: { id: number }) => Promise.resolve(id === 1 ? shelfOne : shelfTwo));
  });
  afterEach(cleanup);

  if (registration === "barcode") {
    it("links the barcode to the created container after checking for duplicates", async () => {
      render(<Harness initialLocation={shelfOne} />);
      await submitContainer();
      expect(mocks.listExternalLabels).toHaveBeenCalledWith({ qrCodeContent: "external-barcode" });
      await waitFor(() =>
        expect(mocks.createExternalLabel).toHaveBeenCalledWith({
          container: 10,
          qr_code_content: "external-barcode",
        })
      );
    });
  }

  it("lists missing fields above submit and blocks incomplete registration", async () => {
    render(<Harness />);
    const button = screen.getByRole("button", { name: "Register container" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.click(button);
    const warning = await screen.findByRole("alert");
    expect(warning).toHaveTextContent("Location, Chemical, Concentration, Amount");
    expect(warning.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(mocks.create).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Change prop"));
    fireEvent.change(screen.getByLabelText("Chemical"), { target: { value: "4" } });
    fireEvent.change(document.querySelector('input[name="concentration"]')!, { target: { value: "10" } });
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Amount");
      expect(screen.getByRole("alert")).not.toHaveTextContent("Location");
      expect(screen.getByRole("alert")).not.toHaveTextContent("Chemical");
      expect(screen.getByRole("alert")).not.toHaveTextContent("Concentration");
    });
  });

  it("rejects a deselected chemical and blank concentration or amount", async () => {
    render(<Harness initialLocation={shelfOne} />);
    fireEvent.change(screen.getByLabelText("Chemical"), { target: { value: "0" } });
    const containerType = screen.queryByLabelText("Container type");
    if (containerType) fireEvent.change(containerType, { target: { value: "5" } });
    fireEvent.change(document.querySelector('input[name="concentration"]')!, { target: { value: "   " } });
    fireEvent.change(document.querySelector('input[name="amount"]')!, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Register container" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Chemical, Concentration, Amount");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("submits a location supplied on mount without fetching it again", async () => {
    render(<Harness initialLocation={shelfOne} />);
    await submitContainer();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ location: 1 }));
    expect(mocks.getLocation).not.toHaveBeenCalled();
  });

  it.each([null, shelfOne])("uses a location supplied or changed after mount (%j)", async (initialLocation) => {
    render(<Harness initialLocation={initialLocation} />);
    fireEvent.click(screen.getByText("Change prop"));
    await submitContainer();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ location: 2 }));
    expect(mocks.getLocation).not.toHaveBeenCalled();
  });

  it("resets the location and submits a new picker selection", async () => {
    render(<Harness initialLocation={shelfOne} />);
    fireEvent.click(screen.getByText("reset-scan-location"));
    expect(screen.getByLabelText("Location")).toHaveValue("0");
    fireEvent.change(screen.getByLabelText("Location"), { target: { value: "2" } });
    await screen.findByText("Shelf two");
    await submitContainer();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ location: 2 }));
    expect(mocks.getLocation).toHaveBeenCalledTimes(1);
  });

  it("resolves a scanned location once and submits it", async () => {
    render(<Harness initialLocation={shelfOne} />);
    scan("/l/2");
    await screen.findByText("Shelf two");
    await submitContainer();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ location: 2 }));
    expect(mocks.getLocation).toHaveBeenCalledTimes(1);
  });

  it("discards a pending scan when the location is reset", async () => {
    let resolveLocation!: (location: Location) => void;
    mocks.getLocation.mockReturnValue(
      new Promise<Location>((resolve) => {
        resolveLocation = resolve;
      })
    );
    render(<Harness initialLocation={shelfOne} />);
    scan("/l/2");
    fireEvent.click(screen.getByRole("button", { name: "Register container" }));
    await screen.findByText(/Please complete.*Location/);
    expect(mocks.create).not.toHaveBeenCalled();
    scan("reset-scan-location");
    await act(async () => resolveLocation(shelfTwo));
    expect(screen.getByLabelText("Location")).toHaveValue("0");
    expect(screen.getByRole("button", { name: "Register container" })).toBeEnabled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("keeps the latest selection when scan lookups finish out of order", async () => {
    const resolvers = new Map<number, (location: Location) => void>();
    mocks.getLocation.mockImplementation(
      ({ id }: { id: number }) => new Promise<Location>((resolve) => resolvers.set(id, resolve))
    );
    render(<Harness />);
    scan("/l/1");
    scan("/l/2");
    await act(async () => resolvers.get(2)!(shelfTwo));
    await act(async () => resolvers.get(1)!(shelfOne));
    expect(screen.getByText("Shelf two")).toBeInTheDocument();
    await submitContainer();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ location: 2 }));
  });

  it("clears the form selection when the parent clears the location", () => {
    render(<Harness initialLocation={shelfOne} />);
    fireEvent.click(screen.getByText("Clear prop"));
    expect(screen.getByLabelText("Location")).toHaveValue("0");
    expect(screen.getByRole("button", { name: "Register container" })).toBeEnabled();
  });
});
