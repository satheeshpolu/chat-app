import { chatApi } from "../api/chatApi";
import type { ApiMessage, Message } from "../types/chat.types";

function toMessage(msg: ApiMessage): Message {
  return {
    id: msg._id,
    author: msg.author,
    content: msg.message,
    timestamp: msg.createdAt,
  };
}

export const chatService = {
  async fetchMessages(options?: { after?: string }): Promise<Message[]> {
    const msgs = await chatApi.getMessages(options);
    return msgs.map(toMessage);
  },

  async sendMessage(content: string, author: string): Promise<Message> {
    const msg = await chatApi.sendMessage(content, author);
    return toMessage(msg);
  },
};
