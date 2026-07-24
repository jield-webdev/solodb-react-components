import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Col, Form, Row } from "react-bootstrap";
import { Control, Controller } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import { listRooms, Room } from "@jield/solodb-typescript-core";

interface RoomSelectElementProps {
  control: Control<{ room: Room | null }>;
  name: "room";
}

export default function RoomSelectElement({ control, name }: RoomSelectElementProps) {
  const { environment } = useParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await listRooms({
          environment: environment,
          withLocations: true,
        });
        setRooms(response.items);
      } catch (e) {
        console.error("Error fetching rooms:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  if (loading) return <p>Loading labs...</p>;

  return (
    <Form.Group className="mb-3" controlId="chemical.roomSelect">
      <Form.Label as="h3">Choose a lab</Form.Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Row>
            {rooms.map((room) => {
              const isSelected = value?.id === room.id;

              return (
                <Col key={room.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                  <Card
                    aria-label={`Select lab ${room.name}`}
                    aria-pressed={isSelected}
                    className="h-100"
                    onClick={() => onChange(room)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onChange(room);
                      }
                    }}
                    role="button"
                    style={{
                      border: isSelected ? "2px solid #0d6efd" : "1px solid #ddd",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                    tabIndex={0}
                  >
                    <Card.Body>
                      <Card.Title>{room.name}</Card.Title>
                      <div className="text-muted small mb-2">
                        <div>Building: {room.building.name}</div>
                        <div>Scan this QR code to select the lab</div>
                      </div>
                      <div className="text-center mt-2">
                        <QRCodeSVG value={`/r/${room.id}`} size={128} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      />
    </Form.Group>
  );
}
