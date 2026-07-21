import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarUpload } from "@/components/avatar-upload";
import { CourseRequestsPanel, type CourseRequestDetails } from "@/components/course-requests-panel";
import { FavoriteTeachersPanel } from "@/components/favorite-teachers-panel";
import { 
  Users, 
  BookOpen, 
  Search, 
  Loader2, 
  MapPin, 
  Heart, 
  ShieldCheck, 
  PlusCircle,
  Calendar,
  MessageCircle,
  Settings,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardPath } from "@/lib/auth-routing";
import type { User, Parent, Child } from "@shared/schema";
import type { Favorite, Teacher } from "@shared/schema";

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
  const { data: courseRequests, isLoading: requestsLoading } = useQuery<CourseRequestDetails[]>({
    queryKey: ["/api/course-requests"],
  });
  const { data: favorites, isLoading: favoritesLoading } = useQuery<(Favorite & { teacher: (Teacher & { user: User }) | null })[]>({
    queryKey: ["/api/favorites"],
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.user) {
    navigate("/connexion");
    return null;
  }

  if (data.user.role !== "parent") {
    navigate(getDashboardPath(data.user.role));
    return null;
  }

  const { profile, children, user } = data;

  const activeRequests = courseRequests?.filter((request) => ["pending", "accepted"].includes(request.status)).length || 0;
  const completedRequests = courseRequests?.filter((request) => request.status === "completed").length || 0;
  const stats = [
    { label: "Enfants inscrits", value: children?.length || "0", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Cours terminés", value: String(completedRequests), icon: MessageCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: "Demandes actives", value: String(activeRequests), icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <AvatarUpload userId={user.id} currentAvatarUrl={user.avatarUrl} />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Bonjour, {profile?.firstName || "Parent"} !
                {user.isVerified && <ShieldCheck className="h-6 w-6 text-primary" />}
              </h1>
              <p className="text-muted-foreground mt-1">
                Bienvenue sur votre espace parent sécurisé.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/messages">
              <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
              </Button>
            </Link>
            <Link href="/parametres">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </Button>
            </Link>
            <Link href="/trouver-professeur">
              <Button size="sm" className="gap-2 shadow-sm">
                <Search className="h-4 w-4" />
                Trouver un prof
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-card/50 backdrop-blur">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/10 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Mes enfants
                  </CardTitle>
                  <CardDescription>Gérez le suivi scolaire de vos enfants</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1 border-primary/20 text-primary">
                  <PlusCircle className="h-4 w-4" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent>
                {children && children.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {children.map((child) => (
                      <Card key={child.id} className="group relative overflow-hidden border-muted transition-all hover:border-primary/30 hover:shadow-sm">
                        <div className="absolute top-0 right-0 p-2">
                          <Heart className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {child.firstName[0]}
                            </div>
                            <div>
                              <h4 className="font-bold leading-none">
                                {child.firstName} {child.lastName}
                              </h4>
                              <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wider h-5">
                                {child.level}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Matières suivies</p>
                              <div className="flex flex-wrap gap-1">
                                {child.subjects.split(",").map((subject) => (
                                  <Badge key={subject} variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/30 border-none">
                                    {subject.trim()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button variant="link" className="p-0 h-auto text-xs text-primary gap-1 group-hover:underline">
                              Voir la progression <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-muted/20 rounded-xl border-2 border-dashed border-muted">
                    <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">Aucun enfant enregistré</p>
                    <p className="text-xs text-muted-foreground mt-1">Ajoutez vos enfants pour commencer le suivi.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Demandes de cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourseRequestsPanel
                  requests={courseRequests}
                  isLoading={requestsLoading}
                  mode="requester"
                  emptyText="Aucune demande envoyée pour vos enfants."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Professeurs favoris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FavoriteTeachersPanel favorites={favorites} isLoading={favoritesLoading} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Détails du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Nom complet</p>
                      <p className="font-semibold">{profile.firstName} {profile.lastName}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Adresse de résidence</p>
                      <p className="text-sm text-muted-foreground leading-snug">{profile.address}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}
                <Link href="/parametres">
                  <Button variant="ghost" className="w-full text-xs gap-2" size="sm">
                    <Settings className="h-3 w-3" /> Modifier le profil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="mb-2 font-bold text-lg">Besoin d'un prof ?</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  Trouvez le professeur idéal pour aider votre enfant à réussir.
                </p>
                <Link href="/trouver-professeur" className="w-full">
                  <Button className="w-full gap-2 shadow-md" data-testid="button-find-teacher">
                    <BookOpen className="h-4 w-4" />
                    Rechercher
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
}
