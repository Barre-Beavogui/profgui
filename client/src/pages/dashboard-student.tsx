import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, Search, LogOut, Loader2, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import type { User, Student } from "@shared/schema";

interface UserWithStudent {
  user: User;
  profile: Student;
}

export default function StudentDashboard() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<UserWithStudent>({
    queryKey: ["/api/user"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      navigate("/");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.user || data.user.role !== "student") {
    navigate("/connexion");
    return null;
  }

  const { profile } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold">ProfGui</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Bonjour, {profile?.firstName || "Élève"} !
          </h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre espace élève.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Mon profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.city}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Niveau :</span>
                    <Badge variant="secondary" className="ml-2">
                      {profile.level}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Matières recherchées :</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.subjects.split(",").map((subject) => (
                        <Badge key={subject} variant="outline">
                          {subject.trim()}
                        </Badge>
                      ))}
                    </div>
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

          <Card className="hover-elevate">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Trouver un professeur</h3>
              <p className="mb-4 text-muted-foreground">
                Recherchez parmi nos professeurs qualifiés pour trouver le cours idéal.
              </p>
              <Link href="/trouver-professeur">
                <Button className="gap-2" data-testid="button-find-teacher">
                  <BookOpen className="h-4 w-4" />
                  Rechercher
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
