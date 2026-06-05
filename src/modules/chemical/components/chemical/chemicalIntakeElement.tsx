import React, { useCallback, useEffect, useId, useState } from "react";
import RoomSelectElement from "@jield/solodb-react-components/modules/chemical/form/roomSelectElement";
import { Alert, Table } from "react-bootstrap";
import RegisterBarcodeElement from "@jield/solodb-react-components/modules/chemical/components/chemical/registerBarcodeElement";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import RegisterContainerElement from "@jield/solodb-react-components/modules/chemical/components/chemical/registerContainerElement";
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
import { useScannerContext } from "@jield/solodb-react-components/modules/core/contexts/scannerContext";
import { ScannedKeysType } from "@jield/solodb-react-components/modules/core/utils/parseScannerType";

export default function ChemicalIntakeElement() {
  const { environment } = useParams();
  const { addReadingCallbackFn, removeReadingCallbackFn, addCallbackFn, removeCallbackFn } = useScannerContext();

  const [readingKeys, setReadingKeys] = useState<string>("");

  const [foundExternalLabels, setFoundExternalLabels] = useState<ChemicalContainerExternalLabel[]>([]);
  const [foundContainer, setFoundContainer] = useState<ChemicalContainer | null>(null);
  const [enableExternalLabelRegistration, setEnableExternalLabelRegistration] = useState(false);
  const [hasExternalLabelling, setHasExternalLabelling] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [location, setLocation] = useState<Location | null>(null);

  const { control, watch, reset, setValue } = useForm<{ room: Room | null }>({
    defaultValues: { room: null },
  });

  const selectedRoom = watch("room");

  useEffect(() => {
    if (!selectedRoom) return;
    setRoom(selectedRoom);
    setHasExternalLabelling(selectedRoom.building.site.has_external_chemical_labelling);
  }, [selectedRoom]);

  useEffect(() => {
    const roomId = new URLSearchParams(window.location.search).get("room");
    if (!roomId) return;

    getRoom({ id: parseInt(roomId) }).then((loadedRoom) => {
      setRoom(loadedRoom);
      setHasExternalLabelling(loadedRoom.building.site.has_external_chemical_labelling);
      setValue("room", loadedRoom);
    });
  }, [setValue]);

  useEffect(() => {
    const locationId = new URLSearchParams(window.location.search).get("location");
    if (!locationId) return;

    getLocation({ id: parseInt(locationId) }).then((loc) => {
      setLocation(loc);
      setRoom(loc.zone_group.room);
      setHasExternalLabelling(loc.zone_group.room.building.site.has_external_chemical_labelling);
      setValue("room", loc.zone_group.room);
    });
  }, [setValue]);

  const resetForm = useCallback(() => {
    reset({ room });
    setScannedBarcode(null);
    setLocation(null);
    setFoundContainer(null);
    setFoundExternalLabels([]);
    setEnableExternalLabelRegistration(false);
  }, [reset, room]);

  // Scanner: handle QR scans to select chemical container
  const scanCallbackId = useId();

  useEffect(() => {
    addReadingCallbackFn(scanCallbackId, setReadingKeys);

    return () => {
      removeReadingCallbackFn(scanCallbackId);
    };
  }, []);

  const onScanKeys = useCallback(async (keys: string) => {
    if (keys.includes("/l/")) return;

    setScannedBarcode(keys);

    if (keys.includes("/cc/")) {
      const containerId = keys.split("/cc/")[1];
      const container = await getChemicalContainer({ id: parseInt(containerId) });
      setFoundContainer(container);
    }

    try {
      const response = await listChemicalContainerExternalLabels({ qrCodeContent: keys });

      if (response?.items?.length > 0) {
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
  }, []);

  useEffect(() => {
    removeCallbackFn(ScannedKeysType.WILD_CARD, scanCallbackId);
    addCallbackFn(ScannedKeysType.WILD_CARD, scanCallbackId, onScanKeys);
    return () => removeCallbackFn(ScannedKeysType.WILD_CARD, scanCallbackId);
  }, [onScanKeys]);

  // Scanner: handle reset-form QR
  const resetFormCallbackId = useId();

  useEffect(() => {
    removeCallbackFn(ScannedKeysType.RESET_FORM, resetFormCallbackId);
    addCallbackFn(ScannedKeysType.RESET_FORM, resetFormCallbackId, resetForm);
    return () => removeCallbackFn(ScannedKeysType.RESET_FORM, resetFormCallbackId);
  }, [resetForm]);

  return (
    <div>
      <div className="d-flex justify-content-between">
        <div>
          <div style={{ width: "fit-content" }}>
            <RoomSelectElement control={control} name="room" />
          </div>
          <p className={"pt-3"}>Reading from scanner: {readingKeys}</p>
        </div>

        <div className="d-flex flex-column">
          <QRCodeSVG value="reset-form" size={100} className="float-end" onClick={resetForm} />
          <span className="text-muted">Reset form</span>
        </div>
      </div>

      {room && (
        <>
          {hasExternalLabelling ? (
            <Alert>
              Lab {room.name} has external labels, each chemical material should have a material from the internal
              supplier/warehouse
            </Alert>
          ) : (
            <Alert>Lab {room.name} has no external labels, labels can be printed via the intake form</Alert>
          )}
        </>
      )}

      {foundContainer && (
        <Alert variant="info d-flex flex-column gap-3">
          This is already an own chemical material, this is {foundContainer.chemical.name} and should be stored on{" "}
          {foundContainer.location.name} in {foundContainer.location.zone_group.room.name}
          <a
            className="alert-link"
            href={`${environment}/chemical/container/details/${foundContainer.id}/general.html`}
          >
            Go to container
          </a>
        </Alert>
      )}

      {!foundContainer && scannedBarcode && (
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

      {!foundContainer && enableExternalLabelRegistration && room && scannedBarcode && (
        <RegisterBarcodeElement
          room={room}
          barcode={scannedBarcode}
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
