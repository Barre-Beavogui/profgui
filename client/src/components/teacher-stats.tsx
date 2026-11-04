import { Eye, Star, MessageSquareText, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Teacher } from "@shared/schema";

interface TeacherStatsProps {
  teacher?: Teacher | null;
  profileCompletion?: number | null;
}

/**
 * Indicateurs réels du profil professeur (aucune donnée inventée).
 */
export function TeacherStats({ teacher, profileCompletion }: TeacherStatsProps) {
  const rating = Number(teacher?.averageRating ?? 0);
  const items = [
    { label: "Vues du profil", value: String(teacher?.views ?? 0), icon: Eye },
    { label: "Note moyenne", value: rating > 0 ? `${rating.toFixed(1)} / 5` : "—", icon: Star },
    { label: "Avis reçus", value: String(teacher?.totalReviews ?? 0), icon: MessageSquareText },
    { label: "Profil complété", value: `${profileCompletion ?? 0} %`, icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(profileCompletion ?? 0) < 100 && (
        <Card className="border-dashed">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Complétez votre profil</span>
              <span className="text-muted-foreground">{profileCompletion ?? 0} %</span>
            </div>
            <Progress value={profileCompletion ?? 0} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Ajoutez une photo, une présentation, vos diplômes et vos disponibilités. Un profil complet
              inspire davantage confiance aux familles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
