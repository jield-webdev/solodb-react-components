import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Controller } from "react-hook-form";
import { listRooms, Room } from "solodb-typescript-core";

interface RoomSelectElementProps {
  control: any;
  name: string;
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
    <div>
      <h3>Select a lab</h3>
      <Form.Group className="mb-3" controlId="chemical.roomSelect">
        <Controller
          name={name}
          render={({ field: { onChange, value } }) => (
            <Form.Select
              aria-label={"Choose a lab"}
              value={value?.id || ""} // Safely check for value
              onChange={(e) => {
                const selectedRoom = rooms.find((room) => room.id.toString() === e.target.value);
                onChange(selectedRoom || null); // Pass the selected room object to the form
              }}
            >
              <option value="">— Choose a lab</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </Form.Select>
          )}
          control={control}
        />
      </Form.Group>
    </div>
  );
}
