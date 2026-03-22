import { memo } from "react";
import { formatMessageTime } from "../../../utils/dateUtils";
import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
  showSender?: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  author,
  content,
  timestamp,
  isSelf,
  showSender = true,
}: MessageBubbleProps) {
  return (
    <article
      className={`${styles.wrapper} ${isSelf ? styles.self : styles.other}`}
    >
      <div
        className={`${styles.bubble} ${isSelf ? styles.bubbleSelf : styles.bubbleOther}`}
      >
        {!isSelf && showSender && (
          <span className={styles.senderName} aria-label={`Sender: ${author}`}>
            {author}
          </span>
        )}
        <p className={styles.content}>{content}</p>
        <time
          dateTime={timestamp}
          className={`${styles.timestamp} ${isSelf ? styles.timestampSelf : ""}`}
        >
          {formatMessageTime(timestamp)}
        </time>
      </div>
    </article>
  );
});
