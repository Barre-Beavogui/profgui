import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AvatarUpload } from "@/components/avatar-upload";
import { 
  GraduationCap, 
  BookOpen, 
  Search, 
  Loader2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Star,
  User,
  Settings,
  ArrowRight,
  ShieldCheck,
  MessageCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardPath } from "@/lib/auth-routing";
import type { User as UserType, Student } from "@shared/schema";

interface UserWithStudent {
  user: UserType;
  profile: Student;
}

export default function StudentDashboard() {
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery<UserWithStudent>({
    queryKey: ["/api/user"],
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

  if (data.user.role !== "student") {
    navigate(getDashboardPath(data.user.role));
    return null;
  }

  const { profile, user } = data;

  const stats = [
    { label: "Demandes actives", value: "2", icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Cours complétés", value: "0", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
    { label: "Profs favoris", value: "3", icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
  ];

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <AvatarUpload userId={user.id} currentAvatarUrl={user.avatarUrl} />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Bonjour, {profile?.firstName || "Élève"} !
                {user.isVerified && <ShieldCheck className="h-6 w-6 text-primary" />}
              </h1>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Profil complété</span>
                  <span className="font-bold text-primary">{user.profileCompletion || 0}%</span>
                </div>
                <Progress value={user.profileCompletion || 0} className="h-2 w-48 md:w-64" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/messages">
              <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Mon compte
            </Button>
            <Link href="/trouver-professeur">
              <Button size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                Trouver un prof
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-full ${stat.bg}`}>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Mon profil académique
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">Modifier</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-md">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">Localisation :</span>
                        <span className="text-muted-foreground">{profile.city}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-md">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="font-medium">Niveau d'études :</span>
                        <Badge variant="secondary">
                          {profile.level}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-md">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">Préférence cours :</span>
                        <span className="text-muted-foreground">
                          {profile.courseType === "domicile"
                            ? "À domicile"
                            : profile.courseType === "en_ligne"
                            ? "En ligne"
                            : "Les deux"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground block">Matières suivies</span>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjects.split(",").map((subject) => (
                          <Badge key={subject} variant="outline" className="px-3 py-1 bg-primary/5 border-primary/20 text-primary">
                            {subject.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
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
                <CardTitle className="text-lg">Dernières activités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Search className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Recherche de prof de Maths</p>
                        <p className="text-xs text-muted-foreground">Il y a 2 jours</p>
                      </div>
                    </div>
                    <Badge>En cours</Badge>
                  </div>
                  <div className="text-center py-4">
                    <Link href="/trouver-professeur">
                      <Button variant="link" className="text-sm gap-1">
                        Voir tout l'historique <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="hover-elevate overflow-hidden border-primary/20 shadow-md">
              <div className="h-2 bg-primary w-full" />
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Prêt à apprendre ?</h3>
                <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
                  Accédez à notre réseau de professeurs certifiés et commencez votre progression dès aujourd'hui.
                </p>
                <Link href="/trouver-professeur" className="w-full">
                  <Button className="w-full gap-2 shadow-lg shadow-primary/20" size="lg">
                    Lancer une recherche
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prochains rendez-vous</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <Calendar className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm italic">Aucun cours planifié pour le moment.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
}
