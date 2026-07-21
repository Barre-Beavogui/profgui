import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileAudio, Image as ImageIcon, Loader2, MessageCircle, Mic, Send, Square, User, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MAX_TEXT_LENGTH = 1000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const MAX_RECORDING_SECONDS = 120;

type AttachmentType = "image" | "audio";

interface Attachment {
  type: AttachmentType;
  url: string;
  contentType: string;
  fileName: string;
  size: number;
}

interface Message {
  id: string;
  text?: string | null;
  senderId: string;
  recipientId: string;
  createdAt?: string | Date | null;
  readAt?: string | Date | null;
  attachment?: Attachment | null;
}

interface ChatProps {
  currentUserId: string;
  currentUserName?: string;
  currentUserAvatar?: string | null;
  currentUserRole?: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string | null;
  otherUserRole?: string;
}

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getAttachmentType(file: Blob): AttachmentType | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return null;
}

function validateFile(file: Blob): string | null {
  if (file.type.startsWith("video/")) {
    return "Les vidéos ne sont pas autorisées dans la messagerie.";
  }
  if (file.type.startsWith("image/") && file.size > MAX_IMAGE_BYTES) {
    return "Photo trop volumineuse. Limite : 3 Mo.";
  }
  if (file.type.startsWith("audio/") && file.size > MAX_AUDIO_BYTES) {
    return "Vocal trop volumineux. Limite : 5 Mo.";
  }
  if (!getAttachmentType(file)) {
    return "Format non autorisé. Envoyez une photo ou un vocal.";
  }
  return null;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function formatMessageTime(value?: string | Date | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "HH:mm", { locale: fr });
}

export function Chat({
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserAvatar,
}: ChatProps) {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const chatId = [currentUserId, otherUserId].sort().join("_");
  const trimmedMessage = newMessage.trim();
  const conversationQueryKey = [`/api/messages/${otherUserId}`];

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: conversationQueryKey,
    enabled: !!currentUserId && !!otherUserId && currentUserId !== otherUserId,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ text, attachment }: { text: string; attachment?: Attachment }) => {
      const res = await apiRequest("POST", "/api/messages", {
        recipientUserId: otherUserId,
        text,
        attachment: attachment || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKey });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markConversationReadMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/messages/${otherUserId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  useEffect(() => {
    if (!currentUserId || !otherUserId || currentUserId === otherUserId) return;
    markConversationReadMutation.mutate();
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);

    return () => window.clearTimeout(timer);
  }, [messages.length, chatId]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function uploadAttachment(file: Blob, type: AttachmentType, fileName: string): Promise<Attachment> {
    const fileData = await readBlobAsDataUrl(file);
    const res = await apiRequest("POST", "/api/chat/attachments/upload", {
      fileData,
      fileName,
      type,
    });
    return res.json();
  }

  async function sendMessage(text: string, attachment?: Attachment) {
    if (!text && !attachment) return;
    await sendMessageMutation.mutateAsync({ text, attachment });
  }

  async function handleSendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (isSending || (!trimmedMessage && !selectedFile)) return;

    setIsSending(true);
    const text = trimmedMessage.slice(0, MAX_TEXT_LENGTH);
    const file = selectedFile;
    setNewMessage("");
    setSelectedFile(null);

    try {
      let attachment: Attachment | undefined;
      if (file) {
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }
        const type = getAttachmentType(file)!;
        attachment = await uploadAttachment(file, type, file.name || (type === "image" ? "photo" : "vocal"));
      }
      await sendMessage(text, attachment);
    } catch (error) {
      toast({
        title: "Message non envoyé",
        description: error instanceof Error ? error.message : "Impossible d'envoyer ce message.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }

  function handleFileSelect(file: File | undefined) {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Fichier refusé",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  async function startRecording() {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast({
        title: "Vocal indisponible",
        description: "Votre navigateur ne permet pas l'enregistrement audio.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const preferredType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setIsRecording(false);
        setRecordingSeconds(0);
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        if (blob.size > MAX_AUDIO_BYTES) {
          toast({
            title: "Vocal trop long",
            description: "Le message vocal dépasse la limite de 5 Mo.",
            variant: "destructive",
          });
          return;
        }

        setIsSending(true);
        try {
          const attachment = await uploadAttachment(blob, "audio", "message-vocal.webm");
          await sendMessage("", attachment);
        } catch (error) {
          toast({
            title: "Vocal non envoyé",
            description: error instanceof Error ? error.message : "Impossible d'envoyer ce vocal.",
            variant: "destructive",
          });
        } finally {
          setIsSending(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((seconds) => {
          if (seconds + 1 >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return seconds + 1;
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Micro non accessible",
        description: "Autorisez l'accès au micro pour envoyer un message vocal.",
        variant: "destructive",
      });
    }
  }

  const selectedFileType = selectedFile ? getAttachmentType(selectedFile) : null;

  return (
    <div className="flex h-[500px] w-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b bg-muted/50 p-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherUserAvatar || ""} />
          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-sm font-semibold leading-none">{otherUserName}</h3>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Compte ProfGui
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isOwn
                        ? "rounded-tr-none bg-primary text-primary-foreground"
                        : "rounded-tl-none bg-muted text-foreground"
                    }`}
                  >
                    {msg.attachment?.type === "image" && (
                      <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="mb-2 block">
                        <img
                          src={msg.attachment.url}
                          alt={msg.attachment.fileName || "Photo envoyée"}
                          className="max-h-64 rounded-lg object-cover"
                        />
                      </a>
                    )}
                    {msg.attachment?.type === "audio" && (
                      <div className="mb-2 flex min-w-[220px] items-center gap-2">
                        <FileAudio className="h-4 w-4 shrink-0" />
                        <audio controls src={msg.attachment.url} className="h-9 w-full max-w-xs" />
                      </div>
                    )}
                    {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                    <p className={`mt-1 text-[10px] opacity-70 ${isOwn ? "text-right" : "text-left"}`}>
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-20" />
                <p className="text-sm">Démarrez la conversation avec {otherUserName}</p>
                <p className="mt-1 text-xs">Texte, photo et vocal autorisés. Vidéo interdite.</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {selectedFile && (
        <div className="border-t bg-muted/30 px-4 py-2">
          <div className="flex items-center justify-between gap-3 rounded-md bg-background px-3 py-2 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              {selectedFileType === "image" ? <ImageIcon className="h-4 w-4 text-primary" /> : <FileAudio className="h-4 w-4 text-primary" />}
              <span className="truncate">{selectedFile.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatSize(selectedFile.size)}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedFile(null)} aria-label="Retirer le fichier">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex flex-col gap-2 border-t p-4">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/mp3,audio/wav,audio/webm,audio/ogg,audio/mp4,audio/x-m4a"
          onChange={(event) => {
            handleFileSelect(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isRecording}
            aria-label="Joindre une photo ou un audio"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className="shrink-0 rounded-full"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSending}
            aria-label={isRecording ? "Arrêter l'enregistrement vocal" : "Enregistrer un vocal"}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            placeholder="Écrivez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, MAX_TEXT_LENGTH))}
            maxLength={MAX_TEXT_LENGTH}
            className="flex-1 rounded-full px-4"
            disabled={isSending || isRecording}
          />
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-full"
            disabled={isSending || isRecording || (!trimmedMessage && !selectedFile)}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{isRecording ? `Enregistrement vocal ${recordingSeconds}s / ${MAX_RECORDING_SECONDS}s` : "Photos 3 Mo max, vocaux 5 Mo max, vidéos interdites."}</span>
          <span>{newMessage.length}/{MAX_TEXT_LENGTH}</span>
        </div>
      </form>
    </div>
  );
}
