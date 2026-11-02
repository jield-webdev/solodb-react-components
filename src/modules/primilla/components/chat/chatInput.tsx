import { FormEvent, KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";

interface ChatInputProps {
  disabled: boolean;
  onSend: (message: string) => void;
}

export default function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && text.trim().length > 0;

  // Grow with the content; the CSS max-height caps it and enables scrolling.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  const submit = () => {
    if (!canSend) return;
    onSend(text);
    setText("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <Form className="primilla-composer d-flex align-items-end gap-2 border bg-body-tertiary" onSubmit={handleSubmit}>
      <Form.Control
        ref={textareaRef}
        as="textarea"
        rows={1}
        value={text}
        placeholder="Ask Primilla"
        aria-label="Message Primilla"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        className="primilla-composer-input border-0 bg-transparent shadow-none"
      />
      <button
        type="submit"
        className="btn btn-primary rounded-circle flex-shrink-0 primilla-composer-send"
        disabled={!canSend}
        aria-label="Send message"
      >
        <i className="fa fa-arrow-up" aria-hidden="true" />
      </button>
    </Form>
  );
}
