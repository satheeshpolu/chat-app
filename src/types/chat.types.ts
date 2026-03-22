// Raw shape returned by the backend
export interface ApiMessage {
  _id: string;
  message: string;
  author: string;
  createdAt: string;
}

// Internal shape used by the UI
export interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string; // ISO string
}
