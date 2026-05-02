import { useState, useMemo, useCallback } from "react";
import { ArrowLeft, Bot, Plus, Trash2, MessageSquare, PanelLeftOpen, PanelLeftClose, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useRepairs } from "@/hooks/useRepairs";
import { useChatHistory } from "@/hooks/useChatHistory";
import AIChatPanel from "@/components/AIChatPanel";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function AIPage() {
  useDarkMode();
  const { repairs } = useRepairs();
  const chat = useChatHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const repairsForAI = useMemo(
    () =>
      repairs.map((r) => ({
        clientName: r.clientName,
        deviceModel: r.deviceModel,
        problem: r.problem,
        status: r.status,
        createdAt: r.createdAt,
      })),
    [repairs]
  );

  const initialMessages = useMemo(
    () => chat.messages.map((m) => ({ role: m.role, content: m.content })),
    [chat.messages]
  );

  const filteredConversations = useMemo(
    () =>
      searchQuery.trim()
        ? chat.conversations.filter((c) =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : chat.conversations,
    [chat.conversations, searchQuery]
  );

  const handleConversationCreated = useCallback(
    (id: string) => {
      chat.setActiveId(id);
      chat.fetchConversations();
    },
    [chat.setActiveId, chat.fetchConversations]
  );

  const handleNewChat = () => {
    chat.newChat();
    setSidebarOpen(false);
  };

  const handleSelectConv = (id: string) => {
    chat.loadConversation(id);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* History Sidebar */}
      <aside
        className={`fixed sm:relative z-50 sm:z-auto h-full w-72 bg-card border-r border-border flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0 sm:w-0 sm:border-0 sm:overflow-hidden"
        }`}
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Historial</span>
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-primary"
            title="Nuevo chat"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="px-2 py-2 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-sm rounded-md bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              {searchQuery ? "Sin resultados" : "Sin conversaciones aún"}
            </p>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer border-b border-border/50 hover:bg-secondary/50 transition-colors ${
                  chat.activeId === conv.id ? "bg-primary/10" : ""
                }`}
                onClick={() => handleSelectConv(conv.id)}
              >
                <MessageSquare size={14} className="shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{conv.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    chat.deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-lg h-14 flex items-center px-3 sm:px-4 gap-2">
          <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft size={18} className="text-foreground" />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title="Historial de chats"
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
              {chat.activeId
                ? chat.conversations.find((c) => c.id === chat.activeId)?.title || "Asistente IA"
                : "Asistente IA"}
            </h1>
            <p className="text-[10px] text-muted-foreground">TecniAviso</p>
          </div>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-primary"
            title="Nuevo chat"
          >
            <Plus size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          <AIChatPanel
            repairs={repairsForAI}
            conversationId={chat.activeId}
            onConversationCreated={handleConversationCreated}
            onMessageSaved={chat.saveMessage}
            onAssistantMessageUpdated={chat.updateLastAssistantMessage}
            initialMessages={initialMessages}
          />
        </div>
      </div>
    </div>
  );
}
