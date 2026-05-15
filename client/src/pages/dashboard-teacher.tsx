import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GraduationCap, BookOpen, Clock, CheckCircle, XCircle, Loader2, MapPin, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User, Teacher } from "@shared/schema";

interface UserWithTeacher {
  user: User;
  profile: Teacher;
}

export default function TeacherDashboard() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<UserWithTeacher>({
    queryKey: ["/api/user"],
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.user || data.user.role !== "teacher") {
    navigate("/connexion");
    return null;
  }

  const { profile, user } = data;

  const getStatusIcon = () => {
    if (user?.status === "approved") {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (user?.status === "rejected") {
      return <XCircle className="h-5 w-5 text-destructive" />;
    }
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusAlert = () => {
    if (user?.status === "pending") {
      return (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Profil en attente de validation</AlertTitle>
          <AlertDescription>
            Votre profil est en cours d'examen par notre équipe. Vous recevrez une notification 
            une fois qu'il sera validé.
          </AlertDescription>
        </Alert>
      );
    }
    if (user?.status === "rejected") {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Profil non validé</AlertTitle>
          <AlertDescription>
            Votre profil n'a pas été validé. Veuillez nous contacter pour plus d'informations.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Profil validé</AlertTitle>
        <AlertDescription>
          Votre profil est visible par les élèves et parents. Les familles peuvent vous 
          contacter directement.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Bonjour, {profile?.firstName || "Professeur"} !
          </h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre espace professeur.
          </p>
        </div>

        <div className="mb-8">{getStatusAlert()}</div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Mon profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {profile.firstName} {profile.lastName}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon()}
                      <Badge
                        variant={
                          user?.status === "approved"
                            ? "default"
                            : user?.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {user?.status === "approved"
                          ? "Validé"
                          : user?.status === "rejected"
                          ? "Refusé"
                          : "En attente"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.city}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.diploma}</span>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Matières :</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.subjects.split(",").map((subject) => (
                        <Badge key={subject} variant="secondary">
                          {subject.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Niveaux :</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.levels.split(",").map((level) => (
                        <Badge key={level} variant="outline">
                          {level.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Disponibilités :</span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.availability}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Type de cours :</span>
                    <span className="ml-2 text-muted-foreground">
                      {profile.courseType === "domicile"
                        ? "À domicile"
                        : profile.courseType === "en_ligne"
                        ? "En ligne"
                        : "Les deux"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Présentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.bio ? (
                <p className="text-muted-foreground">{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  Aucune présentation ajoutée.
                </p>
              )}

              {profile?.experience && (
                <div className="mt-4">
                  <span className="text-sm font-medium">Expérience :</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {profile.experience}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}
