import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ensureInitialThread } from "@/lib/chat-storage";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FanVault — Your Sports Chat" },
      { name: "description", content: "Start a sports conversation about your teams, players, and matchday questions." },
      { property: "og:title", content: "FanVault — Your Sports Chat" },
      { property: "og:description", content: "A fast, friendly sports companion for every fan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const thread = ensureInitialThread();
    void navigate({ to: "/chat/$threadId", params: { threadId: thread.id }, replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-9 animate-pulse rounded-full bg-primary" aria-label="Opening FanVault" />
    </div>
  );
}
