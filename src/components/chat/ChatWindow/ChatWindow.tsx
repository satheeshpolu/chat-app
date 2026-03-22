import { MessageList } from "../MessageList";
import { MessageInput } from "../MessageInput";
import { useMessages } from "../../../hooks/useMessages";
import { useCurrentUser } from "../../../store/chatStore";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  roomName?: string;
}

export function ChatWindow({ roomName = "Chat" }: ChatWindowProps) {
  const { messages, isLoading, isError, sendMessage, isSending, sendError } =
    useMessages();
  const currentUser = useCurrentUser();

  if (!currentUser) return null;

  return (
    <main className={styles.window}>
      <header className={styles.header} aria-label={`${roomName} chat room`}>
        <h1 className={styles.roomName}>{roomName}</h1>
      </header>
      <MessageList
        messages={messages}
        currentUser={currentUser}
        isLoading={isLoading}
        isError={isError}
      />
      {sendError && (
        <p className={styles.sendError} role="alert">
          Failed to send message. Please try again.
        </p>
      )}
      <MessageInput onSend={sendMessage} disabled={isSending} />
    </main>
  );
}
