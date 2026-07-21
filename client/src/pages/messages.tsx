import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, ShieldCheck } from "lucide-react";
import { ConversationList } from "@/components/conversation-list";
import { Chat } from "@/components/chat";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Link, useLocation } from "wouter";

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

  if (user.role !== "admin") {
    return (
      <Layout>
        <main className="mx-auto max-w-3xl px-4 py-12 md:px-8">
          <Card className="border-primary/10 shadow-sm">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Messagerie centralisée par ProfGui</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Pour protéger les familles et les professeurs, les échanges directs sont désactivés. Envoyez une demande de cours depuis une fiche professeur ; l'administration ProfGui coordonne ensuite la mise en relation.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/trouver-professeur">
                  <Button>Trouver un professeur</Button>
                </Link>
                <Link href={user.role === "teacher" ? "/dashboard/professeur" : user.role === "parent" ? "/dashboard/parent" : "/dashboard/eleve"}>
                  <Button variant="outline">Retour à mon espace</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ma Messagerie</h1>
          <p className="text-muted-foreground">Gérez les échanges d'administration et les suivis de mise en relation.</p>
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
