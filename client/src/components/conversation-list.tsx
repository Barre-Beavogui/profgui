import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ConversationUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role?: string | null;
}

interface ChatMessage {
  id: string;
  text?: string | null;
  attachmentType?: "text" | "image" | "audio" | null;
  createdAt?: string | Date | null;
}

interface Conversation {
  id: string;
  otherUser: ConversationUser;
  lastMessage: ChatMessage;
  unreadCount: number;
}

interface ConversationListProps {
  currentUserId: string;
  onSelectConversation: (otherUserId: string, otherUserName: string, otherUserAvatar?: string | null, otherUserRole?: string | null) => void;
}

function formatConversationDate(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "d MMM", { locale: fr });
}

function getLastMessagePreview(message: ChatMessage) {
  if (message.text) return message.text;
  if (message.attachmentType === "image") return "Photo";
  if (message.attachmentType === "audio") return "Message vocal";
  return "Message";
}

export function ConversationList({ currentUserId, onSelectConversation }: ConversationListProps) {
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    enabled: !!currentUserId,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Chargement des discussions...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl bg-muted/5">
        <MessageCircle className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="font-bold text-lg">Aucune discussion</h3>
        <p className="text-sm text-muted-foreground max-w-[200px] mt-2">
          Recherchez un compte ProfGui pour démarrer une conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const otherUser = conv.otherUser;
        const lastMessage = getLastMessagePreview(conv.lastMessage);

        return (
          <Card 
            key={conv.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors border-none shadow-sm"
            onClick={() => onSelectConversation(otherUser.id, otherUser.name, otherUser.avatarUrl || "", otherUser.role)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={otherUser?.avatarUrl || ""} />
                <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm truncate">{otherUser.name}</span>
                  <div className="flex items-center gap-2">
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        {conv.unreadCount}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {formatConversationDate(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                </div>
                <p className={`text-xs truncate leading-relaxed ${conv.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {lastMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
