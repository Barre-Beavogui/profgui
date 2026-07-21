import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, Search, ShieldCheck, User as UserIcon } from "lucide-react";
import { ConversationList } from "@/components/conversation-list";
import { Chat } from "@/components/chat";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";

interface CurrentUserData {
  user: User;
  profile?: { firstName?: string; lastName?: string } | null;
}

interface MessagingUser {
  id: string;
  name: string;
  role: User["role"];
  avatarUrl: string | null;
  profileHeadline: string | null;
  isVerified: boolean | null;
}

interface SelectedConversation {
  id: string;
  name: string;
  avatar?: string | null;
  role?: string;
}

function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Admin";
    case "teacher":
      return "Prof";
    case "parent":
      return "Parent";
    case "student":
      return "Élève";
    default:
      return role;
  }
}

function getCurrentUserName(data: CurrentUserData) {
  const firstName = data.profile?.firstName || "";
  const lastName = data.profile?.lastName || "";
  return [firstName, lastName].filter(Boolean).join(" ") || data.user.email || data.user.phone || "Utilisateur";
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedInitialUserId, setAppliedInitialUserId] = useState<string | null>(null);
  const [location, navigate] = useLocation();
  const initialUserId = new URLSearchParams(location.split("?")[1] || "").get("user");

  const { data: userData, isLoading } = useQuery<CurrentUserData>({
    queryKey: ["/api/user"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<MessagingUser[]>({
    queryKey: [`/api/users/search?q=${encodeURIComponent(searchTerm.trim())}`],
    enabled: !!userData?.user,
  });

  const { data: initialUser } = useQuery<MessagingUser>({
    queryKey: [`/api/users/${initialUserId}/public`],
    enabled: !!userData?.user && !!initialUserId,
  });

  useEffect(() => {
    if (initialUser && appliedInitialUserId !== initialUser.id) {
      setSelectedConversation({
        id: initialUser.id,
        name: initialUser.name,
        avatar: initialUser.avatarUrl,
        role: initialUser.role,
      });
      setAppliedInitialUserId(initialUser.id);
    }
  }, [appliedInitialUserId, initialUser]);

  if (isLoading) return null;
  if (!userData?.user) {
    navigate("/connexion");
    return null;
  }

  const { user } = userData;
  const currentUserName = getCurrentUserName(userData);

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ma Messagerie</h1>
          <p className="text-muted-foreground">
            Discutez avec les comptes ProfGui : texte, photo et vocal. Les vidéos sont bloquées.
          </p>
        </div>

        <div className="grid min-h-[620px] gap-6 lg:grid-cols-[370px_1fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-sm">
              <CardHeader className="border-b bg-muted/30 py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-primary" />
                  Démarrer une discussion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Rechercher un élève, parent, prof..."
                />
                <ScrollArea className="h-56">
                  <div className="space-y-2 pr-2">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : !users || users.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">Aucun compte trouvé.</p>
                    ) : (
                      users.map((messageUser) => (
                        <button
                          key={messageUser.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-muted"
                          onClick={() =>
                            setSelectedConversation({
                              id: messageUser.id,
                              name: messageUser.name,
                              avatar: messageUser.avatarUrl,
                              role: messageUser.role,
                            })
                          }
                        >
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={messageUser.avatarUrl || ""} />
                            <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold">{messageUser.name}</span>
                              {messageUser.isVerified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                {roleLabel(messageUser.role)}
                              </Badge>
                              {messageUser.profileHeadline && (
                                <span className="truncate text-xs text-muted-foreground">{messageUser.profileHeadline}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="flex min-h-[300px] flex-col overflow-hidden border-none shadow-sm">
              <CardHeader className="border-b bg-muted/30 py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
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
          </div>

          <Card className="flex min-h-[620px] flex-col overflow-hidden border-none bg-muted/10 shadow-sm">
            {selectedConversation ? (
              <Chat
                currentUserId={user.id}
                currentUserName={currentUserName}
                currentUserAvatar={user.avatarUrl}
                currentUserRole={user.role}
                otherUserId={selectedConversation.id}
                otherUserName={selectedConversation.name}
                otherUserAvatar={selectedConversation.avatar}
                otherUserRole={selectedConversation.role}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-bold">Vos messages</h3>
                <p className="mt-2 max-w-sm leading-relaxed text-muted-foreground">
                  Recherchez un compte ou sélectionnez une conversation pour envoyer du texte, une photo ou un vocal.
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </Layout>
  );
}
