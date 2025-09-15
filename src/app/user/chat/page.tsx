"use client"; 

import { useEffect, useMemo, useState } from "react";
import { Search, MessageSquare, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useChatConversations, useChatMessages } from "@/hooks/useChat";
import { Conversation } from "@/types/chat.types";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const { items: conversations, loading } = useChatConversations();
  const searchParams = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { messages, send, markRead, peerTyping, startTyping, stopTyping } = useChatMessages(selectedConversationId || undefined);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (selectedConversationId) {
      markRead().catch(() => {});
    }
  }, [selectedConversationId, markRead]);

 useEffect(() => {
    const q = searchParams?.get('conv')
    if (q) setSelectedConversationId(q)
  }, [searchParams])
  

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return conversations.filter((c: Conversation) =>
      (c.userId + c.interviewerId + (c.lastMessage || "")).toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const current = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) || null,
  [conversations, selectedConversationId]);

  const handleSend = async () => {
    if (!draft.trim() || !current) return;
    // As a user, recipient is interviewerId
    await send(current.interviewerId, draft.trim());
    setDraft("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#3B0A58]">
      
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-xl border-r border-purple-400/20">
          {/* Header */}
          <div className="p-6 border-b border-purple-400/20">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              <h1 className="text-xl font-semibold text-white">Chats</h1>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-purple-400/20 text-white placeholder:text-gray-400 focus:border-purple-400/50"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto">
          {loading ? (
              <div className="p-4 text-gray-400">Loading...</div>
            ) : (
              filtered.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`p-4 border-b border-purple-400/10 cursor-pointer transition-all duration-200 hover:bg-purple-400/10 ${
                    selectedConversationId === conversation.id ? "bg-purple-400/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={undefined} alt={conversation.interviewerId} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white font-semibold">
                          {conversation.interviewerId?.charAt(0) ?? "I"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">{conversation.interviewerId}</h3>
                        <span className="text-xs text-gray-400">
                          {new Date(conversation.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-400 truncate">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                        {conversation.unreadForUser ? (
                          <Badge className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {conversation.unreadForUser}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}  
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
        {current ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-purple-400/20 bg-black/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
                      {current.interviewerId?.charAt(0) ?? "I"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-white">{current.interviewerId}</h2>
                      <p className="text-sm text-purple-300">{peerTyping ? 'is typing…' : 'Conversation'}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3">
              {messages.map((m) => {
                  const isSelf = m.senderId === (current?.userId) // user is viewing, so self is userId
                  return (
                    <div key={m.id} className={`text-white flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className="text-xs text-gray-400">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </div>
                      <div className={`inline-block px-3 py-2 rounded max-w-[70%] ${isSelf ? 'bg-purple-600/80' : 'bg-white/10'}`}>
                        {m.text}
                      </div>
                    </div>
                    )
                })}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-purple-400/20 bg-black/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Type your message..."
                     value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value)
                      if (e.target.value.trim()) startTyping(); else stopTyping();
                    }}
                    onBlur={stopTyping}
                    className="flex-1 bg-white/5 border-purple-400/20 text-white placeholder:text-gray-400 focus:border-purple-400/50"
                  />
                  <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-purple-400" />
              </div>
               <h2 className="text-2xl font-semibold text-white mb-3">Select a chat to start messaging</h2>
              <p className="text-gray-400 max-w-md">Choose a conversation from the sidebar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

