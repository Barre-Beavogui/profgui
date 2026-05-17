import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { ConversationList } from "@/components/conversation-list";
import { Chat } from "@/components/chat";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<{ id: string, name: string, avatar?: string } | null>(null);
  const [, navigate] = useLocation();

  const { data: userData, isLoading } = useQuery<{ user: User }>({
    queryKey: ["/api/user"],
  });

  if (isLoading) return null;
  if (!userData?.user) {
    navigate("/connexion");
    return null;
  }

  const { user } = userData;

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ma Messagerie</h1>
          <p className="text-muted-foreground">Gérez vos échanges avec les professeurs et les familles.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr] h-[calc(100vh-250px)] min-h-[500px]">
          <Card className="border-none shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Discussions
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-2">
                <ConversationList 
                  currentUserId={user.id} 
                  onSelectConversation={(id, name, avatar) => setSelectedConversation({ id, name, avatar })} 
                />
              </div>
            </ScrollArea>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden flex flex-col bg-muted/10">
            {selectedConversation ? (
              <Chat 
                currentUserId={user.id}
                otherUserId={selectedConversation.id}
                otherUserName={selectedConversation.name}
                otherUserAvatar={selectedConversation.avatar}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <h3 className="font-bold text-2xl">Vos messages</h3>
                <p className="text-muted-foreground max-w-sm mt-2 leading-relaxed">
                  Sélectionnez une conversation à gauche pour commencer à discuter en temps réel.
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </Layout>
  );
}
