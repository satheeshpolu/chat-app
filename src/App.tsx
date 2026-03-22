import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatPage } from "./pages/ChatPage";
import {
  QUERY_GC_TIME_MS,
  QUERY_RETRY_COUNT,
  QUERY_STALE_TIME_MS,
} from "./constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: QUERY_RETRY_COUNT,
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: QUERY_GC_TIME_MS,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatPage />
    </QueryClientProvider>
  );
}

export default App;
