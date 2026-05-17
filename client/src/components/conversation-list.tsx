import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Conversation {
  id: string;
  lastMessage: string;
  lastMessageAt: any;
  participants: string[];
}

interface ConversationListProps {
  currentUserId: string;
  onSelectConversation: (otherUserId: string, otherUserName: string, otherUserAvatar?: string) => void;
}

export function ConversationList({ currentUserId, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef, 
      where("participants", "array-contains", currentUserId),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      setConversations(convs);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

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
          Vos conversations avec les professeurs apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const otherUserId = conv.participants.find(p => p !== currentUserId);
        if (!otherUserId) return null;

        // In a real app, we'd fetch the other user's profile info here or store it in the chat doc
        // For now, we'll use a placeholder or handle it in the parent component
        return (
          <Card 
            key={conv.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors border-none shadow-sm"
            onClick={() => onSelectConversation(otherUserId, "Chargement...", "")}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12 border">
                <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm truncate">Discussion</span>
                  <span className="text-[10px] text-muted-foreground">
                    {conv.lastMessageAt?.toDate ? format(conv.lastMessageAt.toDate(), "d MMM", { locale: fr }) : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate leading-relaxed">
                  {conv.lastMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
