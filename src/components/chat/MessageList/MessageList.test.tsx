import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageList } from "./MessageList";
import type { Message } from "../../../types/chat.types";

// TanStack Virtual requires a real layout engine to know which rows are in view.
// In jsdom there is no layout, so we mock the virtualizer to always render all items.
vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        index: i,
        start: i * 72,
        key: i,
      })),
    getTotalSize: () => count * 72,
    scrollToIndex: vi.fn(),
    measureElement: vi.fn(),
  }),
}));

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "1",
  author: "Alice",
  content: "Hello world",
  timestamp: "2026-03-22T10:00:00.000Z",
  ...overrides,
});

describe("MessageList", () => {
  it("shows loading state", () => {
    render(<MessageList messages={[]} currentUser="Alice" isLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
  });

  it("shows full-screen error when load fails with no messages", () => {
    render(<MessageList messages={[]} currentUser="Alice" isError />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/could not load messages/i)).toBeInTheDocument();
  });

  it("shows inline error banner when poll fails but messages exist", () => {
    const messages = [makeMessage()];
    render(<MessageList messages={messages} currentUser="Alice" isError />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/failed to refresh messages/i)).toBeInTheDocument();
  });

  it("shows empty state when there are no messages", () => {
    render(<MessageList messages={[]} currentUser="Alice" />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it("renders messages in the list", () => {
    const messages = [
      makeMessage({ id: "1", content: "First message" }),
      makeMessage({ id: "2", content: "Second message", author: "Bob" }),
    ];
    render(<MessageList messages={messages} currentUser="Alice" />);
    expect(screen.getByText("First message")).toBeInTheDocument();
    expect(screen.getByText("Second message")).toBeInTheDocument();
  });

  it("renders the message log with correct aria attributes", () => {
    const messages = [makeMessage()];
    render(<MessageList messages={messages} currentUser="Alice" />);
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-label", "Message history");
    expect(log).toHaveAttribute("aria-live", "polite");
  });

  it("shows sender name for other users", () => {
    const messages = [makeMessage({ author: "Bob", content: "Hey there" })];
    render(<MessageList messages={messages} currentUser="Alice" />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("does not show sender name for own messages", () => {
    const messages = [makeMessage({ author: "Alice", content: "My message" })];
    render(<MessageList messages={messages} currentUser="Alice" />);
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });
});
