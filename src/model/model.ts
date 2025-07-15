export interface message {
  userText: string,
  isLoading: boolean,
  aiText: string
}

export interface StreamResult {
  type: "chunk" | "end" | "error";
  content: string;
}
