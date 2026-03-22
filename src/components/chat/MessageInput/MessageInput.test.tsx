import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "./MessageInput";

describe("MessageInput", () => {
  it("renders the input and send button", () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(
      screen.getByRole("textbox", { name: /type a message/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<MessageInput onSend={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeDisabled();
  });

  it("send button is enabled once the user types", async () => {
    render(<MessageInput onSend={vi.fn()} />);
    await userEvent.type(
      screen.getByRole("textbox", { name: /type a message/i }),
      "Hello",
    );
    expect(screen.getByRole("button", { name: /send message/i })).toBeEnabled();
  });

  it("calls onSend with trimmed content when the form is submitted", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);
    await userEvent.type(
      screen.getByRole("textbox", { name: /type a message/i }),
      "  Hello  ",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /send message/i }),
    );
    expect(onSend).toHaveBeenCalledOnce();
    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("clears the input after sending", async () => {
    render(<MessageInput onSend={vi.fn()} />);
    const input = screen.getByRole("textbox", { name: /type a message/i });
    await userEvent.type(input, "Hello");
    await userEvent.click(
      screen.getByRole("button", { name: /send message/i }),
    );
    expect(input).toHaveValue("");
  });

  it("calls onSend when Enter is pressed", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);
    const input = screen.getByRole("textbox", { name: /type a message/i });
    await userEvent.type(input, "Hello{Enter}");
    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("does not call onSend when Shift+Enter is pressed", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);
    const input = screen.getByRole("textbox", { name: /type a message/i });
    await userEvent.type(input, "Hello");
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables when the disabled prop is true", () => {
    render(<MessageInput onSend={vi.fn()} disabled />);
    expect(
      screen.getByRole("textbox", { name: /type a message/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeDisabled();
  });

  it("does not call onSend for whitespace-only input", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} />);
    await userEvent.type(
      screen.getByRole("textbox", { name: /type a message/i }),
      "   {Enter}",
    );
    expect(onSend).not.toHaveBeenCalled();
  });
});
