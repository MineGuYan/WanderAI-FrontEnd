export interface message {
  userText: string,
  isLoading: boolean,
  aiText: string
}

export interface StreamResult {
  type: "chunk" | "end" | "error",
  content: string
}

export interface HistoryChat {
  title: string,
  sessionId: string
}

export interface HistoryMessage {
  type: "ai" | "human",
  content: string
}