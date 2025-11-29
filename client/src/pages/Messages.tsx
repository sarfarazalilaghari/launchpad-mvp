import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MessageSquare, Send, Loader2, ArrowLeft } from "lucide-react";
import type { Message, User } from "@shared/schema";

interface MessageWithUsers extends Message {
  sender: User;
  recipient: User;
}

interface Conversation {
  id: string;
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery<MessageWithUsers[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 5000,
  });

  const { data: conversationMessages, isLoading: conversationLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", selectedConversation],
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/messages", {
        recipientId: selectedConversation,
        content: newMessage,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedConversation] });
    },
  });

  // Group messages into conversations
  const conversations: Conversation[] = [];
  const conversationMap = new Map<string, Conversation>();

  messages?.forEach((msg) => {
    const otherUserId = msg.senderId === user?.id ? msg.recipientId : msg.senderId;
    const otherUser = msg.senderId === user?.id ? msg.recipient : msg.sender;

    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        id: otherUserId,
        otherUser,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    const conv = conversationMap.get(otherUserId)!;
    if (!msg.read && msg.recipientId === user?.id) {
      conv.unreadCount++;
    }
  });

  conversationMap.forEach((conv) => conversations.push(conv));
  conversations.sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt!).getTime() -
      new Date(a.lastMessage.createdAt!).getTime()
  );

  const selectedOtherUser = conversations.find((c) => c.id === selectedConversation)?.otherUser;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase() || "U";
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* Conversations List */}
          <Card className={`md:col-span-1 ${selectedConversation ? "hidden md:block" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-340px)]">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b ${
                        selectedConversation === conv.id ? "bg-muted" : ""
                      }`}
                      data-testid={`conversation-${conv.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={conv.otherUser?.profileImageUrl || undefined}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(conv.otherUser?.firstName, conv.otherUser?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">
                            {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage.senderId === user?.id ? "You: " : ""}
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className={`md:col-span-2 flex flex-col ${!selectedConversation ? "hidden md:flex" : ""}`}>
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                    data-testid="button-back-to-list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedOtherUser?.profileImageUrl || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(selectedOtherUser?.firstName, selectedOtherUser?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium" data-testid="text-chat-user-name">
                      {selectedOtherUser?.firstName} {selectedOtherUser?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedOtherUser?.role}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {conversationLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                          <Skeleton className="h-12 w-48 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : conversationMessages?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversationMessages?.map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : ""}`}
                            data-testid={`message-${msg.id}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-xl px-4 py-2 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="leading-relaxed">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        sendMutation.mutate();
                      }
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      data-testid="input-new-message"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sendMutation.isPending}
                      data-testid="button-send"
                    >
                      {sendMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
