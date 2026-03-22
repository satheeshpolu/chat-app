import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatWindow } from "./ChatWindow";

// ── Stub heavy child components so tests stay focused on ChatWindow ──────────

vi.mock("../MessageList", () => ({
  MessageList: ({
    isLoading,
    isError,
  }: {
    isLoading?: boolean;
    isError?: boolean;
  }) => (
    <div
      data-testid="message-list"
      data-loading={isLoading}
      data-error={isError}
    />
  ),
}));

vi.mock("../MessageInput", () => ({
  MessageInput: ({
    onSend,
    disabled,
  }: {
    onSend: (msg: string) => void;
    disabled?: boolean;
  }) => (
    <button
      data-testid="message-input"
      disabled={disabled}
      onClick={() => onSend("hello")}
    >
      Send
    </button>
  ),
}));

// ── Mock hooks ────────────────────────────────────────────────────────────────

const mockSendMessage = vi.fn();

const mockUseMessages = vi.fn(() => ({
  messages: [],
  isLoading: false,
  isError: false,
  sendMessage: mockSendMessage,
  isSending: false,
  sendError: null,
}));

const mockUseCurrentUser = vi.fn(() => "Alice");

vi.mock("../../../hooks/useMessages", () => ({
  useMessages: (...args: unknown[]) => mockUseMessages(...args),
}));

vi.mock("../../../store/chatStore", () => ({
  useCurrentUser: (...args: unknown[]) => mockUseCurrentUser(...args),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Re-import with a fresh module registry so vi.mock overrides take effect. */
const renderChatWindow = (props = {}) => render(<ChatWindow {...props} />);

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("ChatWindow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the room name in the header", () => {
    renderChatWindow({ roomName: "General" });
    expect(
      screen.getByRole("heading", { name: "General" }),
    ).toBeInTheDocument();
  });

  it("uses 'Chat' as the default room name", () => {
    renderChatWindow();
    expect(screen.getByRole("heading", { name: "Chat" })).toBeInTheDocument();
  });

  it("sets aria-label on the header to include the room name", () => {
    renderChatWindow({ roomName: "Lobby" });
    expect(
      screen.getByRole("banner", { name: "Lobby chat room" }),
    ).toBeInTheDocument();
  });

  it("renders the MessageList and MessageInput", () => {
    renderChatWindow();
    expect(screen.getByTestId("message-list")).toBeInTheDocument();
    expect(screen.getByTestId("message-input")).toBeInTheDocument();
  });

  it("does not show the send-error banner by default", () => {
    renderChatWindow();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the send-error banner when sendError is present", () => {
    mockUseMessages.mockReturnValueOnce({
      messages: [],
      isLoading: false,
      isError: false,
      sendMessage: mockSendMessage,
      isSending: false,
      sendError: new Error("Network error"),
    });
    renderChatWindow();
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/failed to send message/i);
  });

  it("passes isLoading to MessageList", () => {
    mockUseMessages.mockReturnValueOnce({
      messages: [],
      isLoading: true,
      isError: false,
      sendMessage: mockSendMessage,
      isSending: false,
      sendError: null,
    });
    renderChatWindow();
    expect(screen.getByTestId("message-list")).toHaveAttribute(
      "data-loading",
      "true",
    );
  });

  it("passes isError to MessageList", () => {
    mockUseMessages.mockReturnValueOnce({
      messages: [],
      isLoading: false,
      isError: true,
      sendMessage: mockSendMessage,
      isSending: false,
      sendError: null,
    });
    renderChatWindow();
    expect(screen.getByTestId("message-list")).toHaveAttribute(
      "data-error",
      "true",
    );
  });

  it("disables MessageInput while a message is sending", () => {
    mockUseMessages.mockReturnValueOnce({
      messages: [],
      isLoading: false,
      isError: false,
      sendMessage: mockSendMessage,
      isSending: true,
      sendError: null,
    });
    renderChatWindow();
    expect(screen.getByTestId("message-input")).toBeDisabled();
  });

  it("calls sendMessage when the input fires onSend", async () => {
    const user = userEvent.setup();
    renderChatWindow();
    await user.click(screen.getByTestId("message-input"));
    expect(mockSendMessage).toHaveBeenCalledWith("hello");
  });

  it("returns null when there is no current user", () => {
    mockUseCurrentUser.mockReturnValueOnce(null);
    const { container } = renderChatWindow();
    expect(container.firstChild).toBeNull();
  });
});
