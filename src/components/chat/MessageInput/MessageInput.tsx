import { memo, useState, type KeyboardEvent } from "react";
import { MAX_MESSAGE_LENGTH } from "../../../constants";
import styles from "./MessageInput.module.css";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput = memo(function MessageInput({
  onSend,
  disabled = false,
}: MessageInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!e.shiftKey) handleSend();
    }
  };

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
    >
      <label htmlFor="message-input" className={styles.srOnly}>
        Type a message
      </label>
      <input
        id="message-input"
        className={styles.input}
        value={value}
        placeholder="Message"
        aria-label="Type a message"
        disabled={disabled}
        maxLength={MAX_MESSAGE_LENGTH}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        type="submit"
        className={styles.sendBtn}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        Send
      </button>
    </form>
  );
});
