import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import Select, { StylesConfig } from "react-select";
import UserFormElement from "@jield/solodb-react-components/modules/core/form/element/userFormElement";
import { StatusMailContext } from "@jield/solodb-react-components/modules/equipment/contexts/statusMailContext";
import {
  createLocationMessage,
  listLocationMessageTypes,
  listRooms,
  LocationMessage,
  MessageType,
  Room,
  updateLocationMessage,
} from "@jield/solodb-typescript-core";

interface MessageModalFormProps {
  showModal: boolean;
  onClose: (message: LocationMessage | undefined) => void;
  message?: LocationMessage | undefined;
}

type RoomOption = {
  value: Room;
  label: string;
};

type MessageTypeOption = {
  value: MessageType;
  label: string;
};

const isDarkMode = () => {
  return document.documentElement.getAttribute("data-bs-theme") === "dark";
};

const selectStyles: StylesConfig = {
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

const getSelectedRoomOptions = (
  selectedRooms: Room[] | undefined,
  roomOptionsById: Map<Room["id"], RoomOption>
): RoomOption[] => {
  const selectedOptions: RoomOption[] = [];
  for (const room of selectedRooms ?? []) {
    const option = roomOptionsById.get(room.id);
    if (option) {
      selectedOptions.push(option);
    }
  }
  return selectedOptions;
};

const MessageModalForm: React.FC<MessageModalFormProps> = ({ showModal, onClose, message }) => {
  const { register, handleSubmit, setValue, reset, control } = useForm<LocationMessage>({
    defaultValues: {
      title: message?.title,
      description: message?.description,
      rooms: message?.rooms,
      type: message?.type,
      owner: message?.owner,
    },
  });

  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [messageTypes, setMessageTypes] = useState<MessageTypeOption[]>([]);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const roomOptionsById = useMemo(() => new Map(roomOptions.map((option) => [option.value.id, option])), [roomOptions]);

  let { statusMail } = useContext(StatusMailContext);

  useEffect(() => {
    listRooms({ pageSize: 1000 })
      .then((response) => {
        const optionsParsed: RoomOption[] = response.items.map((room) => ({
          value: room,
          label: room.name,
        }));
        setRoomOptions(optionsParsed);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setErrorMessage("Error fetching rooms:" + err);
      });

    listLocationMessageTypes({ pageSize: 1000 })
      .then((response) => {
        // Without a message type filter on the status mail, all types are allowed
        const messageTypeFilter = statusMail.filter?.messageType;
        const statusMailTypes = messageTypeFilter ? new Set(messageTypeFilter.map(String)) : null;
        const optionsParsed: MessageTypeOption[] = [];
        for (const type of response.items) {
          if (statusMailTypes && !statusMailTypes.has(type.id.toString())) {
            continue;
          }
          optionsParsed.push({
            value: type,
            label: type.type,
          });
        }
        setMessageTypes(optionsParsed);
        const defaultType = message?.type || optionsParsed[0]?.value;
        if (defaultType) {
          setValue("type", defaultType);
        }
      })
      .catch((err) => {
        console.error("Error fetching message types:", err);
        setErrorMessage("Error fetching message types:" + err);
      });
  }, []);

  const getMissingData = (data: LocationMessage): string => {
    if (!data.title) return "title";
    // The owner field holds a user option ({ value, label }) after selecting, or the existing user
    else if ((data?.owner as unknown as { value?: number } | null)?.value === undefined && !message?.owner)
      return "owner";
    else if (data.rooms === undefined || data.rooms.map((room) => room.id).length <= 0) return "room";
    else if (!data.type) return "type";

    return "";
  };

  const handleFormSubmit = async (data: LocationMessage) => {
    const missingData = getMissingData(data);
    if (missingData !== "") {
      setErrorMessage("Please fill: " + missingData);
      return;
    }
    try {
      const ownerId: number | undefined =
        (data?.owner as unknown as { value?: number } | null)?.value ?? message?.owner?.id;
      if (ownerId === undefined) {
        setErrorMessage("Please fill: owner");
        return;
      }

      const postData = {
        title: data.title,
        description: data.description ?? undefined,
        owner: ownerId,
        type: data.type.id,
        rooms: data.rooms.map((room) => room.id),
      };

      const response = message
        ? await updateLocationMessage({ id: message.id, ...postData })
        : await createLocationMessage(postData);

      if (response) {
        onClose(response);
        reset();
        return;
      }

      console.error("No response received");
      setErrorMessage("No response received");
    } catch (error) {
      console.error("Error submitting the form:", error);
      setErrorMessage("Error submitting the form:" + error);
    }
  };

  return (
    <Modal show={showModal} size="lg" centered onHide={() => onClose(message)}>
      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit status mail message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Title Field */}
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control type="text" placeholder="Enter the title" {...register("title")} />
          </Form.Group>

          {/* Description Field */}
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Give the message" {...register("description")} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Owner</Form.Label>
            <UserFormElement
              control={control}
              {...register("owner", {
                required: "Owner is required",
              })}
              name={"owner"}
            />
          </Form.Group>

          {/* Rooms Multi-select */}
          <Form.Group className="mb-3">
            <Form.Label>Rooms</Form.Label>
            <Controller
              name="rooms"
              control={control}
              render={({ field }) => (
                <Select
                  isMulti
                  options={roomOptions}
                  classNamePrefix="react-select"
                  placeholder="Select one or more rooms"
                  value={getSelectedRoomOptions(field.value, roomOptionsById)}
                  onChange={(selected) => field.onChange((selected as RoomOption[]).map((opt) => opt.value))}
                  styles={selectStyles}
                />
              )}
            />
          </Form.Group>

          {/* Message type single select */}
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  options={messageTypes}
                  classNamePrefix="react-select"
                  placeholder="— Select a message type"
                  value={messageTypes.find((opt) => opt.value.id === field.value?.id) || null}
                  onChange={(selected) => field.onChange((selected as MessageTypeOption)?.value)}
                  styles={selectStyles}
                />
              )}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {errorMessage != "" && <span className="text-danger">{errorMessage}</span>}
          <Button variant="secondary" onClick={() => onClose(message)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {message ? "Update Message" : "Create Message"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MessageModalForm;
