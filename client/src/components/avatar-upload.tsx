import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, User } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
}

export function AvatarUpload({ userId, currentAvatarUrl }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!storage) {
        toast({
          title: "Indisponible",
          description: "Le stockage n'est pas configuré.",
          variant: "destructive",
        });
        return;
      }
      setIsUploading(true);

      // Compression
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${userId}`);
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);

      // Save URL to our PostgreSQL database via API
      await apiRequest("PATCH", "/api/user/avatar", { avatarUrl: downloadURL });

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été enregistrée avec succès.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer la photo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage src={currentAvatarUrl || ""} alt="Avatar" />
          <AvatarFallback>
            <User className="h-12 w-12 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatar-input"
          className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}
