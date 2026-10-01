import { createFileRoute } from "@tanstack/react-router";
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";

const BOT_API_URL = process.env["BOT_API_URL"] ?? "http://localhost:8000/chat";

const getLastUserQuestion = (messages: UIMessage[]): string => {
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUser) return "";
  return lastUser.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .trim();
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return Response.json({ message: "Messages are required." }, { status: 400 });
        }
        const question = getLastUserQuestion(body.messages as UIMessage[]);
        if (!question) {
          return Response.json({ message: "A question is required." }, { status: 400 });
        }

        let answer: string;
        try {
          const botResponse = await fetch(BOT_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question }),
            signal: request.signal,
          });
          if (!botResponse.ok) {
            return Response.json(
              { message: `The FanVault server answered with status ${botResponse.status}.` },
              { status: 502 }
            );
          }
          const data = (await botResponse.json()) as { answer?: unknown };
          if (typeof data.answer !== "string" || !data.answer.trim()) {
            return Response.json(
              { message: "The FanVault server returned no answer." },
              { status: 502 }
            );
          }
          answer = data.answer;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") throw error;
          return Response.json(
            { message: "Could not reach the FanVault server. Is it running on localhost:8000?" },
            { status: 502 }
          );
        }

        const stream = createUIMessageStream({
          execute: ({ writer }) => {
            const id = crypto.randomUUID();
            writer.write({ type: "text-start", id });
            writer.write({ type: "text-delta", id, delta: answer });
            writer.write({ type: "text-end", id });
          },
        });
        return createUIMessageStreamResponse({ stream });
      },
    },
  },
});
