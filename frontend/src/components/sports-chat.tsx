"use client";

import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { createThread, readThreads, threadTitle, type ChatThread, writeThreads } from "@/lib/chat-storage";
import { useChat } from "@ai-sdk/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Menu, MessageCircle, Plus, Radio, Trash2, Trophy, X } from "lucide-react";
import bannerSky from "@/assets/banner-sky.jpg";
import runnerImg from "@/assets/banner-runner.png";
import footballerImg from "@/assets/banner-footballer.png";
import swimmerImg from "@/assets/banner-swimmer.png";
import sidebarImg from "@/assets/sidebar.jpg";
import chatBgImg from "@/assets/chat-bg.jpg";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const prompts = ["Preview tonight’s game", "Explain a rule", "Compare two players"];

function saveThread(threadId: string, messages: UIMessage[]) {
  const all = readThreads();
  const current = all.find((thread) => thread.id === threadId);
  const updated: ChatThread = { id: threadId, title: threadTitle(messages), updatedAt: Date.now(), messages };
  writeThreads([updated, ...all.filter((thread) => thread.id !== threadId && thread.id !== current?.id)]);
}

export function SportsChat({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [ready, setReady] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = readThreads();
    const match = stored.find((thread) => thread.id === threadId);
    if (!match) {
      const created = createThread();
      created.id = threadId;
      writeThreads([created, ...stored]);
      setThreads([created, ...stored]);
    } else setThreads(stored);
    setReady(true);
  }, [threadId]);

  const current = threads.find((thread) => thread.id === threadId);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const onFinish = useCallback(({ messages }: { messages: UIMessage[] }) => {
    saveThread(threadId, messages);
    setThreads(readThreads());
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [threadId]);
  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: threadId,
    messages: current?.messages ?? [],
    transport,
    onFinish,
  });

  useEffect(() => {
    if (!ready || !current || chatLoaded) return;
    setMessages(current.messages);
    setChatLoaded(true);
  }, [chatLoaded, current, ready, setMessages]);

  useEffect(() => {
    if (!ready || !chatLoaded) return;
    saveThread(threadId, messages);
    setThreads(readThreads());
  }, [chatLoaded, messages, ready, threadId]);

  useEffect(() => { textareaRef.current?.focus(); }, [threadId, status]);

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || status === "submitted" || status === "streaming") return;
    await sendMessage({ text: value });
  };

  const addThread = () => {
    const created = createThread();
    writeThreads([created, ...readThreads()]);
    void navigate({ to: "/chat/$threadId", params: { threadId: created.id } });
    setSidebarOpen(false);
  };

  const removeThread = (id: string) => {
    const remaining = readThreads().filter((thread) => thread.id !== id);
    const next = remaining[0] ?? createThread();
    if (!remaining.length) remaining.push(next);
    writeThreads(remaining);
    setThreads(remaining);
    if (id === threadId) void navigate({ to: "/chat/$threadId", params: { threadId: next.id } });
  };

  if (!ready || !current) return <div className="min-h-screen bg-background" />;

  return (
    <main className="flex h-dvh overflow-hidden bg-background text-foreground">
      {sidebarOpen && <button className="fixed inset-0 z-20 bg-foreground/20 md:hidden" aria-label="Close conversations" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r bg-sky bg-cover bg-bottom transition-transform md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ backgroundImage: `url(${sidebarImg})` }}>
        <div className="flex h-16 items-center justify-between border-b border-navy/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Trophy className="size-4" /></div>
            <div><p className="text-lg font-extrabold text-navy">FanVault</p><p className="text-xs text-muted-foreground">Sports companion</p></div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close"><X /></Button>
        </div>
        <div className="p-4"><Button className="w-full justify-start gap-2" onClick={addThread}><Plus /> New conversation</Button></div>
        <div className="px-4 pb-2 text-xs font-semibold uppercase text-muted-foreground">Conversations</div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {threads.map((thread) => (
            <div key={thread.id} className={`group flex items-center rounded-md ${thread.id === threadId ? "bg-card shadow-sm" : "hover:bg-card/60"}`}>
              <Link to="/chat/$threadId" params={{ threadId: thread.id }} onClick={() => setSidebarOpen(false)} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3">
                <MessageCircle className={`size-4 shrink-0 ${thread.id === threadId ? "text-primary" : "text-muted-foreground"}`} />
                <span className="truncate text-sm font-medium">{thread.title}</span>
              </Link>
              <Button variant="ghost" size="icon-sm" className="mr-1 opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => removeThread(thread.id)} aria-label={`Delete ${thread.title}`}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </nav>
        <div className="mb-40 p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-success" /> Saved in this browser</div></div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-sky bg-cover bg-center" style={{ backgroundImage: `url(${chatBgImg})` }}>
        <header className="relative flex h-28 shrink-0 items-center justify-center overflow-hidden border-b border-navy/10 bg-sky bg-cover bg-center" style={{ backgroundImage: `url(${bannerSky})` }}>
          <img src={runnerImg} alt="" aria-hidden="true" className="pointer-events-none absolute left-0 top-1 h-auto w-14 object-contain drop-shadow-md sm:w-16 md:w-20 xl:w-24" />
          <img src={footballerImg} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 left-12 h-auto w-16 object-contain drop-shadow-md sm:left-14 sm:w-20 md:left-16 md:w-24 xl:left-20 xl:w-28" />
          <img src={swimmerImg} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-auto w-20 object-contain drop-shadow-md sm:w-24 md:w-28 xl:w-36" />
          <div className="relative z-10 flex w-[44%] max-w-xs min-w-0 items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open conversations"><Menu /></Button>
            <div className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground md:flex"><Trophy className="size-4" /></div>
            <div className="min-w-0 rounded-md bg-card/75 px-2 py-1.5 backdrop-blur-sm md:px-3"><h1 className="truncate text-sm font-extrabold text-navy md:text-lg">{current.title}</h1><div className="flex items-center gap-1.5 whitespace-nowrap text-[10px] text-muted-foreground md:text-xs"><Radio className="size-3 shrink-0 text-success" /> Ready for matchday</div></div>
          </div>
        </header>

        <Conversation className="mx-auto w-full max-w-3xl">
          <ConversationContent className="gap-5 px-4 py-8 md:px-8">
            {messages.map((message) => (
              <Message from={message.role} key={message.id} className="max-w-[88%]">
                {message.role === "assistant" && <span className="mb-1 text-xs font-semibold text-muted-foreground">FanVault</span>}
                <MessageContent className={message.role === "user" ? "rounded-2xl rounded-br-sm bg-chat-user px-4 py-3 text-chat-user-foreground" : "rounded-2xl rounded-bl-sm bg-card/90 px-4 py-3 shadow-sm"}>
                  {message.parts.map((part, index) => part.type === "text" ? <MessageResponse key={index}>{part.text}</MessageResponse> : null)}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && <div className="rounded-2xl rounded-bl-sm bg-card/90 px-4 py-3 text-sm"><Shimmer>Checking the playbook…</Shimmer></div>}
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error.message}</div>}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-4 md:px-8 md:pb-6">
          {messages.length <= 1 && <div className="mb-3 flex flex-wrap gap-2">{prompts.map((prompt) => <Button key={prompt} variant="outline" size="sm" className="rounded-full border-primary/40 bg-card text-primary" onClick={() => void submit(prompt)}>{prompt}</Button>)}</div>}
          <PromptInput onSubmit={({ text }) => submit(text)} className="rounded-2xl border bg-card shadow-sm">
            <PromptInputTextarea ref={textareaRef} placeholder="Ask about a game, team, player, or rule…" className="min-h-14 px-4" />
            <PromptInputFooter className="justify-end px-3 pb-3">
              <PromptInputSubmit status={status} onStop={stop} disabled={status === "submitted"} className="rounded-full" />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-xs text-muted-foreground">FanVault can make mistakes. Check live scores with an official source.</p>
        </div>
      </section>
    </main>
  );
}