import { Link } from "wouter";
import { Heart, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Favorite, Teacher, User } from "@shared/schema";

interface PublicUserSummary {
  id: string;
  avatarUrl: string | null;
  profileHeadline: string | null;
  profileBio: string | null;
  isVerified: boolean | null;
  role: User["role"];
  status: User["status"];
  name?: string;
}

interface FavoriteDetails extends Favorite {
  teacher: (Teacher & { user: PublicUserSummary }) | null;
}

export function FavoriteTeachersPanel({
  favorites,
  isLoading,
}: {
  favorites?: FavoriteDetails[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <Heart className="mb-3 h-10 w-10 opacity-30" />
        <p className="text-sm">Aucun professeur favori pour le moment.</p>
        <Link href="/trouver-professeur">
          <Button variant="link" className="mt-2">Trouver un professeur</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {favorites.map((favorite) => {
        const teacher = favorite.teacher;
        if (!teacher) return null;
        const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`;

        return (
          <Card key={favorite.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={teacher.user.avatarUrl || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-semibold">{teacher.firstName} {teacher.lastName}</h4>
                <p className="truncate text-sm text-primary">
                  {teacher.user.profileHeadline || `Professeur de ${teacher.subjects.split(",")[0]?.trim()}`}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{teacher.city}</span>
                  <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3" />{teacher.averageRating || "0.0"}</Badge>
                </div>
              </div>
              <Link href={`/professeurs/${teacher.id}`}>
                <Button size="sm" variant="outline">Voir</Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
