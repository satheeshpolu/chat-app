import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../services/api/chatApi";
import { useCurrentUser } from "../store/chatStore";
import { POLL_INTERVAL_MS } from "../constants";
import type { ApiMessage, Message } from "../types/chat.types";

export const MESSAGES_QUERY_KEY = ["messages"] as const;

function toMessage(msg: ApiMessage): Message {
  return {
    id: msg._id,
    author: msg.author,
    content: msg.message,
    timestamp: msg.createdAt,
  };
}

export function useMessages() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  // tracks the latest message timestamp so polls only fetch new messages
  const lastTimestampRef = useRef<string | undefined>(undefined);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: MESSAGES_QUERY_KEY,
    queryFn: async (): Promise<Message[]> => {
      const msgs = await chatApi.getMessages(
        lastTimestampRef.current ? { after: lastTimestampRef.current } : {},
      );
      const mapped = msgs.map(toMessage);
      if (msgs.length > 0) {
        lastTimestampRef.current = msgs[msgs.length - 1].createdAt;
      }
      return mapped;
    },
    refetchInterval: POLL_INTERVAL_MS,
    // pause polling when tab is hidden
    refetchIntervalInBackground: false,
    // deduplicate by id when refetch returns overlapping data
    structuralSharing: (oldData: unknown, newData: unknown) => {
      const prev = oldData as Message[] | undefined;
      const next = newData as Message[];
      if (!prev || prev.length === 0) return next;
      const existingIds = new Set(prev.map((m) => m.id));
      const fresh = next.filter((m) => !existingIds.has(m.id));
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    },
  });

  const { mutateAsync: sendMessage } = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser) throw new Error("No user");
      const msg = await chatApi.sendMessage(content.trim(), currentUser);
      return toMessage(msg);
    },
    onSuccess: (newMsg) => {
      // optimistically append to cache without waiting for next poll
      queryClient.setQueryData<Message[]>(MESSAGES_QUERY_KEY, (old = []) => {
        if (old.some((m) => m.id === newMsg.id)) return old;
        return [...old, newMsg];
      });
    },
  });

  return { messages, isLoading, sendMessage };
}
