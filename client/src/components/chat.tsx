import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
}

interface ChatProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string | null;
}

export function Chat({ currentUserId, otherUserId, otherUserName, otherUserAvatar }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Unique chat ID based on participant IDs (sorted to ensure consistency)
  const chatId = [currentUserId, otherUserId].sort().join("_");

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setIsLoading(false);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !db) return;

    const text = newMessage;
    setNewMessage("");

    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text,
        senderId: currentUserId,
        createdAt: serverTimestamp(),
      });

      // Update chat metadata for conversation list
      await setDoc(doc(db, "chats", chatId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        participants: [currentUserId, otherUserId],
      }, { merge: true });

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full border rounded-lg bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50 flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherUserAvatar || ""} />
          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-sm leading-none">{otherUserName}</h3>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> En ligne
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    msg.senderId === currentUserId
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 opacity-70 ${
                    msg.senderId === currentUserId ? "text-right" : "text-left"
                  }`}>
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), "HH:mm", { locale: fr }) : ""}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Démarrez la conversation avec {otherUserName}</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-full px-4"
        />
        <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

import { MessageCircle } from "lucide-react";
