import type { UIMessage } from "ai";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const STORAGE_KEY = "fanside-chat-threads-v1";

const starterMessage: UIMessage = {
  id: "fanside-welcome",
  role: "assistant",
  parts: [{ type: "text", text: "Hey! I’m FanVault — your matchday companion. What are we talking about today?" }],
};

export function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as ChatThread[];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeThreads(threads: ChatThread[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function createThread(): ChatThread {
  return { id: crypto.randomUUID(), title: "New sports chat", updatedAt: Date.now(), messages: [starterMessage] };
}

export function ensureInitialThread(): ChatThread {
  const threads = readThreads();
  const first = threads[0];
  if (first) return first;
  const created = createThread();
  writeThreads([created]);
  return created;
}

export function threadTitle(messages: UIMessage[]) {
  const user = messages.find((message) => message.role === "user");
  const text = user?.parts.filter((part) => part.type === "text").map((part) => part.text).join(" ").trim();
  return text ? (text.length > 34 ? `${text.slice(0, 34)}…` : text) : "New sports chat";
}