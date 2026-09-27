import { SportsChat } from "@/components/sports-chat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Sports Conversation — FanVault" },
      { name: "description", content: "Talk teams, players, games, tactics, and sports stories with FanVault." },
      { property: "og:title", content: "Sports Conversation — FanVault" },
      { property: "og:description", content: "Your personal AI-powered sports conversation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  return <SportsChat key={threadId} threadId={threadId} />;
}