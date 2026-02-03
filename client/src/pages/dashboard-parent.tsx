import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Users, BookOpen, Search, LogOut, Loader2, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import type { User, Parent, Child } from "@shared/schema";

interface UserWithParent {
  user: User;
  profile: Parent;
  children: Child[];
}

export default function ParentDashboard() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<UserWithParent>({
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

  if (!data?.user || data.user.role !== "parent") {
    navigate("/connexion");
    return null;
  }

  const { profile, children } = data;

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
            Bonjour, {profile?.firstName || "Parent"} !
          </h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre espace parent.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Mes enfants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {children && children.length > 0 ? (
                <div className="space-y-4">
                  {children.map((child) => (
                    <Card key={child.id} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {child.firstName} {child.lastName}
                            </h4>
                            <Badge variant="secondary" className="mt-1">
                              {child.level}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm text-muted-foreground">Matières :</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {child.subjects.split(",").map((subject) => (
                              <Badge key={subject} variant="outline" className="text-xs">
                                {subject.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Aucun enfant enregistré
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Mon profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile ? (
                  <>
                    <p className="font-medium">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{profile.address}</p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Trouver un professeur</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Recherchez le professeur idéal pour vos enfants.
                </p>
                <Link href="/trouver-professeur">
                  <Button className="w-full gap-2" data-testid="button-find-teacher">
                    <BookOpen className="h-4 w-4" />
                    Rechercher
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
