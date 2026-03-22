import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";

describe("MessageBubble", () => {
  const baseProps = {
    id: "1",
    author: "Alice",
    content: "Hello world",
    timestamp: "2026-03-22T10:00:00.000Z",
    isSelf: false,
  };

  it("renders the message content", () => {
    render(<MessageBubble {...baseProps} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("shows the sender name for other users", () => {
    render(<MessageBubble {...baseProps} showSender />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("hides the sender name for own messages", () => {
    render(<MessageBubble {...baseProps} isSelf showSender={false} />);
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("renders a semantic time element", () => {
    render(<MessageBubble {...baseProps} />);
    const time = screen.getByRole("time") ?? document.querySelector("time");
    expect(time).toBeInTheDocument();
  });
});
