import { FormEvent, KeyboardEvent, useState } from "react";
import { Button, Form } from "react-bootstrap";

interface ChatInputProps {
  disabled: boolean;
  onSend: (message: string) => void;
}

export default function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <Form className="d-flex align-items-end gap-2" onSubmit={handleSubmit}>
      <Form.Control
        as="textarea"
        rows={2}
        value={text}
        placeholder="Message Primilla..."
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        style={{ resize: "none" }}
      />
      <Button type="submit" disabled={disabled || !text.trim()}>
        Send
      </Button>
    </Form>
  );
}
