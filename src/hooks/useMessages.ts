import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../services/chatService";
import { useCurrentUser } from "../store/chatStore";
import {
  POLL_INTERVAL_MS,
  QUERY_GC_TIME_MS,
  QUERY_RETRY_COUNT,
  QUERY_STALE_TIME_MS,
} from "../constants";
import type { Message } from "../types/chat.types";

export const MESSAGES_QUERY_KEY = ["messages"] as const;

export function useMessages() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  // tracks the latest message timestamp so polls only fetch new messages
  const lastTimestampRef = useRef<string | undefined>(undefined);

  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery<Message[]>({
    queryKey: MESSAGES_QUERY_KEY,
    queryFn: async (): Promise<Message[]> => {
      const msgs = await chatService.fetchMessages(
        lastTimestampRef.current ? { after: lastTimestampRef.current } : {},
      );
      if (msgs.length > 0) {
        lastTimestampRef.current = msgs[msgs.length - 1].timestamp;
      }
      return msgs;
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: QUERY_RETRY_COUNT,
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
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

  const {
    mutateAsync: sendMessage,
    isPending: isSending,
    error: sendError,
  } = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUser) throw new Error("No user");
      return chatService.sendMessage(content.trim(), currentUser);
    },
    onSuccess: (newMsg) => {
      // optimistically append to cache without waiting for next poll
      queryClient.setQueryData<Message[]>(MESSAGES_QUERY_KEY, (old = []) => {
        if (old.some((m) => m.id === newMsg.id)) return old;
        return [...old, newMsg];
      });
    },
  });

  return { messages, isLoading, isError, sendMessage, isSending, sendError };
}
