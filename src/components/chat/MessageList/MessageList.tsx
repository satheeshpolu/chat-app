import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MessageBubble } from "../MessageBubble";
import { isConsecutiveMessage } from "../../../utils/messageUtils";
import type { Message } from "../../../types/chat.types";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  isLoading?: boolean;
}

export function MessageList({
  messages,
  currentUser,
  isLoading = false,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    // estimated height per row — virtualizer refines this after measuring
    estimateSize: () => 72,
    overscan: 5,
  });

  // scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { behavior: "smooth" });
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div
        className={styles.list}
        role="status"
        aria-live="polite"
        aria-label="Loading messages"
      >
        <div className={styles.loading}>Loading messages…</div>
      </div>
    );
  }

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={scrollRef}
      className={styles.list}
      role="log"
      aria-label="Message history"
      aria-live="polite"
      aria-relevant="additions"
    >
      {/* total height spacer — virtualizer positions items inside this */}
      <div
        className={styles.virtualSizer}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {items.map((virtualRow) => {
          const msg = messages[virtualRow.index];
          const prev = messages[virtualRow.index - 1];
          const showSender = !prev || !isConsecutiveMessage(prev, msg);
          return (
            <div
              key={msg.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className={styles.virtualRow}
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <MessageBubble
                id={msg.id}
                author={msg.author}
                content={msg.content}
                timestamp={msg.timestamp}
                isSelf={msg.author === currentUser}
                showSender={showSender}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
