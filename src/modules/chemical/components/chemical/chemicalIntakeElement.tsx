import React, { useEffect, useState } from "react";
import RoomSelectElement from "@/modules/chemical/form/roomSelectElement";
import BarcodeScanElement from "@/modules/chemical/components/chemical/barcodeScanElement";
import { Alert, Table } from "react-bootstrap";
import RegisterBarcodeElement from "@/modules/chemical/components/chemical/registerBarcodeElement";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import RegisterContainerElement from "@/modules/chemical/components/chemical/registerContainerElement";
import {
  Location,
  ChemicalContainer,
  ChemicalContainerExternalLabel,
  getChemicalContainer,
  getLocation,
  getRoom,
  listChemicalContainerExternalLabels,
  Room,
} from "@jield/solodb-typescript-core";

export default function ChemicalIntakeElement() {
  const { environment } = useParams();
  const [barcode, setBarcode] = useState<string | null>(null);
  const [foundExternalLabels, setFoundExternalLabels] = useState<ChemicalContainerExternalLabel[]>([]);
  const [foundContainer, setFoundContainer] = useState<ChemicalContainer | null>(null);

  //Boolean value to determine if we can show the register barcode element
  const [enableExternalLabelRegistration, setEnableExternalLabelRegistration] = useState<boolean>(false);

  //Boolean value to determine if we have found external labels
  const [hasExternalLabelling, setHasExternalLabelling] = useState<boolean>(false);

  //We need a state for the room and the location
  const [room, setRoom] = useState<Room | null>(null);
  const [location, setLocation] = useState<Location | null>(null);

  //Use reactHookForm to create a form for scanning the barcode
  const { control, watch, reset, setValue } = useForm<{
    room: Room | null;
    barcode: string;
  }>({
    defaultValues: {
      room: room,
      barcode: "",
    },
  });

  const selectedRoom = watch("room"); // Watch for room changes in the form

  useEffect(() => {
    // If 'selectedRoom' changes, update the state and dependent logic
    if (selectedRoom) {
      setRoom(selectedRoom);

      // Update additional logic dependent on room
      setHasExternalLabelling(selectedRoom.building.site.has_external_chemical_labelling);

      // Fetch chemical data or other room-specific data if needed
      // Example: Fetch additional room-related data here
      // fetchRoomData(selectedRoom.id);
    }
  }, [selectedRoom]);

  // If roomId is passed via query parameters, load the room on mount
  useEffect(() => {
    const roomId = new URLSearchParams(window.location.search).get("room");
    if (roomId) {
      getRoom({ id: parseInt(roomId) }).then((loadedRoom) => {
        setRoom(loadedRoom);
        setHasExternalLabelling(loadedRoom.building.site.has_external_chemical_labelling);

        setValue("room", loadedRoom); // Prepopulate the form with the room
      });
    }
  }, [setValue]);

  useEffect(() => {
    const locationId = new URLSearchParams(window.location.search).get("location");
    if (locationId) {
      getLocation({ id: parseInt(locationId) }).then((location) => {
        setLocation(location);
        setRoom(location.zone_group.room);
        setHasExternalLabelling(location.zone_group.room.building.site.has_external_chemical_labelling);

        setValue("room", location.zone_group.room); // Set the room in the form
      });
    }
  }, [setValue]);

  //Watch for changes in the barcode field
  //const room = watch('room');
  const barcodeValue = watch("barcode");

  useEffect(() => {
    const handler = setTimeout(() => {
      // Ignore processing if the barcode includes /l/'
      if (barcodeValue?.includes("/l/")) {
        return;
      }

      // When the barcode contains /cc/ it is an own label, we can simply return this container
      // and not search for the external labels
      if (barcodeValue?.includes("/cc/")) {
        setBarcode(barcodeValue); // Store barcode

        // Fetch the container directly
        const containerId = barcodeValue.split("/cc/")[1];
        getChemicalContainer({ id: parseInt(containerId) }).then((container) => {
          setFoundContainer(container);
        });
      }

      if (barcodeValue) {
        setBarcode(barcodeValue); // Store barcode
        findChemicalContainers({ barcode: barcodeValue }); // Fetch data
      }
    }, 1000);

    return () => {
      clearTimeout(handler); // Cleanup timeout on changes
    };
  }, [barcodeValue, reset]);

  useEffect(() => {
    let scannedCode = ""; // Accumulates the scanner input

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore inputs coming from physical keyboard if barcode scanner is exclusively expected
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't process if the user is typing into a text field or textarea
      }

      // Ignore modifier keys like Shift, Ctrl, Alt, etc.
      if (event.key.length > 1 && event.key !== "Enter") {
        return;
      }

      if (event.key === "Enter") {
        // Perform actions on Enter key
        if (scannedCode === "reset-form") {
          resetForm(); // Reset the form
        }
        scannedCode = ""; // Reset the scanned code after processing
      } else {
        scannedCode += event.key; // Append the key to the accumulated code
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reset]);

  //Create a function to reset the form and start over (while keeping the room selected)
  const resetForm = () => {
    reset({ room: room, barcode: "" });

    setBarcode(null);
    setLocation(null);
  };

  async function findChemicalContainers({ barcode }: { barcode: string }) {
    try {
      // Example API call to fetch chemical container external labels
      const response = await listChemicalContainerExternalLabels({
        qrCodeContent: barcode,
      });

      // Parse and set the fetched chemical container external labels
      if (response && Array.isArray(response.items) && response.items.length > 0) {
        setFoundExternalLabels(response.items);
        setEnableExternalLabelRegistration(false);
      } else {
        setEnableExternalLabelRegistration(true);
        setFoundExternalLabels([]);
      }
    } catch (error) {
      console.error("Error fetching chemical container external labels", error);
      setFoundExternalLabels([]);
      setEnableExternalLabelRegistration(false);
    }
  }

  return (
    <div>
      <div className={"d-flex justify-content-between"}>
        <RoomSelectElement control={control} name={"room"} />

        <div className={"d-flex flex-column"}>
          <QRCodeSVG value={"reset-form"} size={100} className={"float-end"} onClick={() => resetForm()} />
          <span className={"text-muted"}>Reset form</span>
        </div>
      </div>

      {room && hasExternalLabelling && (
        <Alert>
          Lab {room.name} has external labels, each chemical material should have a material from the internal
          supplier/warehouse
        </Alert>
      )}

      {room && !hasExternalLabelling && (
        <Alert>Lab {room.name} has no external labels, labels can be printed via the intake form</Alert>
      )}

      {room !== null && !barcode && hasExternalLabelling && <BarcodeScanElement control={control} />}

      {barcode && foundContainer && (
        <Alert variant={"info d-flex flex-column gap-3"}>
          This is already an own chemical material, this is {foundContainer.chemical.name} and should be stored on{" "}
          {foundContainer.location.name} in {foundContainer.location.zone_group.room.name}
          <a
            className={"alert-link"}
            href={`${environment}/chemical/container/details/${foundContainer.id}/general.html`}
          >
            Go to container
          </a>
        </Alert>
      )}

      {!foundContainer && barcode && (
        <>
          {foundExternalLabels.length === 0 ? (
            <Alert variant={"info d-flex flex-column gap-3"}>
              <div>
                No chemical container external labels found with label <strong>{barcode}</strong>
              </div>
            </Alert>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Label</th>
                  <th>Container</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {foundExternalLabels.map((label) => (
                  <tr key={label.id}>
                    <td>{label.id}</td>
                    <td>{label.label}</td>
                    <td>
                      <a href={`/${environment}/chemical/container/details/${label.container.id}/general.html`}>
                        {label.container.chemical.name}
                      </a>
                    </td>
                    <td>
                      <a href={`/${environment}/location/details/${label.container.location.id}/general.html`}>
                        {label.container.location.name}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      {!foundContainer && enableExternalLabelRegistration && room && barcode && (
        <RegisterBarcodeElement
          room={room}
          barcode={barcode}
          location={location}
          setLocation={setLocation}
          resetForm={resetForm}
        />
      )}

      {!foundContainer && room && !hasExternalLabelling && (
        <RegisterContainerElement room={room} location={location} setLocation={setLocation} resetForm={resetForm} />
      )}
    </div>
  );
}
