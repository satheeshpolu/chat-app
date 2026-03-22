import { lazy, Suspense, useState } from "react";
import styles from "./ChatPage.module.css";
import { useCurrentUser, useSetCurrentUser } from "../store/chatStore";

const ChatWindow = lazy(() =>
  import("../components/chat/ChatWindow").then((m) => ({
    default: m.ChatWindow,
  })),
);

export function ChatPage() {
  const currentUser = useCurrentUser();
  const setCurrentUser = useSetCurrentUser();
  const [nameInput, setNameInput] = useState("");

  // restore persisted name synchronously — no flash of the name prompt
  if (!currentUser) {
    const saved = localStorage.getItem("chat_author");
    if (saved) {
      setCurrentUser(saved);
    }
  }

  if (!currentUser) {
    return (
      <main className={`${styles.page} ${styles.centered}`}>
        <form
          className={styles.nameForm}
          aria-labelledby="name-form-heading"
          onSubmit={(e) => {
            e.preventDefault();
            const name = nameInput.trim();
            if (!name) return;
            localStorage.setItem("chat_author", name);
            setCurrentUser(name);
          }}
        >
          <h1 id="name-form-heading" className={styles.nameTitle}>
            Enter your name to join
          </h1>
          <label htmlFor="join-name" className={styles.srOnly}>
            Your name
          </label>
          <input
            id="join-name"
            className={styles.nameInput}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            autoFocus
            autoComplete="nickname"
            maxLength={50}
          />
          <button
            type="submit"
            className={styles.joinBtn}
            disabled={!nameInput.trim()}
          >
            Join Chat
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className={styles.page}>
      <Suspense
        fallback={
          <div
            className={styles.loadingScreen}
            aria-live="polite"
            aria-label="Loading chat"
          >
            Loading…
          </div>
        }
      >
        <ChatWindow roomName="General" />
      </Suspense>
    </div>
  );
}
