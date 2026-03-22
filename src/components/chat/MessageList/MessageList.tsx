import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MessageBubble } from "../MessageBubble";
import { isConsecutiveMessage } from "../../../utils/messageUtils";
import type { Message } from "../../../types/chat.types";
import styles from "./MessageList.module.css";
import { BOTTOM_THRESHOLD_PX } from "../../../constants";

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  isLoading?: boolean;
  isError?: boolean;
}

export function MessageList({
  messages,
  currentUser,
  isLoading = false,
  isError = false,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(messages.length);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    // estimated height per row — virtualizer refines this after measuring
    estimateSize: () => 72,
    overscan: 5,
  });

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const near =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD_PX;
    setIsNearBottom(near);
    if (near) setHasUnread(false);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // auto-scroll only when the user is already near the bottom
  useEffect(() => {
    if (messages.length === prevLengthRef.current) return;
    prevLengthRef.current = messages.length;
    if (messages.length === 0) return;
    if (isNearBottom) {
      virtualizer.scrollToIndex(messages.length - 1, {
        behavior: reducedMotion ? "auto" : "smooth",
      });
      setHasUnread(false);
    } else {
      setHasUnread(true);
    }
  }, [messages.length, isNearBottom]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (isError && messages.length === 0) {
    return (
      <div
        className={styles.list}
        role="alert"
        aria-label="Error loading messages"
      >
        <div className={styles.error}>
          Could not load messages. Check your connection and try again.
        </div>
      </div>
    );
  }

  const items = virtualizer.getVirtualItems();

  return (
    <div className={styles.container}>
      {isError && (
        <p className={styles.errorBanner} role="alert">
          Failed to refresh messages.
        </p>
      )}
      <div
        ref={scrollRef}
        className={styles.list}
        role="log"
        aria-label="Message history"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">
              &#x1F4AC;
            </span>
            <p className={styles.emptyText}>No messages yet — say hello!</p>
          </div>
        ) : (
          /* total height spacer — virtualizer positions items inside this */
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
        )}
      </div>
      {hasUnread && (
        <button
          className={styles.scrollBtn}
          onClick={() => {
            virtualizer.scrollToIndex(messages.length - 1, {
              behavior: reducedMotion ? "auto" : "smooth",
            });
            setHasUnread(false);
          }}
          aria-label="Scroll to new messages"
        >
          &#x2193; New messages
        </button>
      )}
    </div>
  );
}
