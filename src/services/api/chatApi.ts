import { API_BASE_URL, AUTH_TOKEN, MESSAGES_PER_PAGE } from "../../constants";
import type { ApiMessage } from "../../types/chat.types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const chatApi = {
  getMessages(options?: {
    limit?: number;
    after?: string;
  }): Promise<ApiMessage[]> {
    const params = new URLSearchParams();
    params.set("limit", String(options?.limit ?? MESSAGES_PER_PAGE));
    if (options?.after) params.set("after", options.after);
    return request<ApiMessage[]>(`/api/v1/messages?${params.toString()}`);
  },

  sendMessage(message: string, author: string): Promise<ApiMessage> {
    return request<ApiMessage>("/api/v1/messages", {
      method: "POST",
      body: JSON.stringify({ message, author }),
    });
  },
};
