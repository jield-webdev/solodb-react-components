import React, { useEffect, useState } from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { Controller } from "react-hook-form";
import { listLocations, Location, Room } from "solodb-typescript-core";

interface LocationSelectorWithQRProps {
  control: any; // React Hook Form's `control`
  name: string; // Field name for the form
  room: Room; // Room object for fetching locations
}

export default function LocationSelectorWithQR({ control, name, room }: LocationSelectorWithQRProps) {
  const [locations, setLocations] = useState<Location[]>([]); // Stores locations fetched from the API
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  // Fetch locations via API on component mount
  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await listLocations({ room: room, pageSize: 1000 }); // Fetch locations with a page size of 1000
        setLocations(response.items);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching locations:", e);
      }
    }

    fetchLocations();
  }, [room]);

  if (loading) {
    return <p>Loading locations...</p>;
  }

  return (
    <Form.Group className="mb-3" controlId="chemical.roomSelect">
      <Form.Label>Select a storage location</Form.Label>
      {/* Controller for React Hook Form */}
      <Controller
        name={name}
        control={control}
        defaultValue="" // Default value for the controlled field
        render={({ field: { onChange, value } }) => (
          <>
            {/* Row of Cards */}
            <Row>
              {locations.map((location) => (
                <Col key={location.id} xs={4} md={3} className="mb-3">
                  <Card
                    onClick={() => onChange(location.id.toString())} // Call `onChange` when a location is selected
                    style={{
                      cursor: "pointer",
                      border: value.toString() === location.id.toString() ? "2px solid #007bff" : "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                    className="h-100"
                  >
                    <Card.Body>
                      <Card.Title>{location.name}</Card.Title>
                      <div className="text-muted small mb-2 d-flex gap-2 justify-content-between">
                        {location.code && <div>Code: {location.code}</div>}
                        {location.zone_group && <div>Zone group: {location.zone_group.name}</div>}
                      </div>
                      {/* Render the QR Code for the location */}
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "10px",
                        }}
                      >
                        <QRCodeSVG value={"/l/" + location.id.toString()} size={128} /> {/* QR Code for the location */}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      />
    </Form.Group>
  );
}
