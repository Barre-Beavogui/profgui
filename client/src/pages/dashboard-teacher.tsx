import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AvatarUpload } from "@/components/avatar-upload";
import { TeacherReviews } from "@/components/teacher-reviews";
import { ConversationList } from "@/components/conversation-list";
import { Chat } from "@/components/chat";
import { TeacherStats } from "@/components/teacher-stats";
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  MapPin, 
  Award,
  Eye,
  MessageSquare,
  TrendingUp,
  Settings,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Star,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User, Teacher } from "@shared/schema";

interface UserWithTeacher {
  user: User;
  profile: Teacher;
}

export default function TeacherDashboard() {
  const [, navigate] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<{ id: string, name: string, avatar?: string } | null>(null);

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
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Profil validé</AlertTitle>
          {user.isVerified && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 flex gap-1 h-5 px-1.5 ml-2">
              <ShieldCheck className="h-3 w-3" /> Vérifié
            </Badge>
          )}
        </div>
        <AlertDescription>
          Votre profil est visible par les élèves et parents. Les familles peuvent vous 
          contacter directement.
        </AlertDescription>
      </Alert>
    );
  };

  const stats = [
    { label: "Vues du profil", value: profile?.views || "0", icon: Eye, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Note moyenne", value: profile?.averageRating || "0.0", icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Demandes", value: profile?.totalReviews || "0", icon: MessageSquare, color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <AvatarUpload userId={user.id} currentAvatarUrl={user.avatarUrl} />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Bonjour, {profile?.firstName || "Professeur"} !
                {user.isVerified && <ShieldCheck className="h-6 w-6 text-primary" />}
              </h1>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Complétion du profil</span>
                  <span className="font-bold text-primary">{user.profileCompletion}%</span>
                </div>
                <Progress value={user.profileCompletion} className="h-2 w-48 md:w-64" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </Button>
            <Link href="/marketplace">
              <Button size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Voir Public
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8">{getStatusAlert()}</div>

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

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="h-12 w-full max-w-lg bg-muted/50 p-1 mb-8">
            <TabsTrigger value="profile" className="flex-1 font-bold">Mon Profil</TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 font-bold">Messages</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 font-bold">Avis Clients</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 font-bold">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Mon profil professionnel
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary">Modifier</Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profile ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <span className="font-semibold text-lg">
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

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-medium">Ville :</span>
                                <span className="text-muted-foreground">{profile.city}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Award className="h-4 w-4 text-primary" />
                                <span className="font-medium">Diplôme :</span>
                                <span className="text-muted-foreground">{profile.diploma}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium">Type :</span>
                                <span className="text-muted-foreground">
                                  {profile.courseType === "domicile"
                                    ? "À domicile"
                                    : profile.courseType === "en_ligne"
                                    ? "En ligne"
                                    : "Les deux"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Disponibilités</h4>
                            <p className="text-sm whitespace-pre-wrap">{profile.availability}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2">Matières enseignées</span>
                            <div className="flex flex-wrap gap-2">
                              {profile.subjects.split(",").map((subject) => (
                                <Badge key={subject} variant="secondary" className="px-3 py-1">
                                  {subject.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2">Niveaux ciblés</span>
                            <div className="flex flex-wrap gap-2">
                              {profile.levels.split(",").map((level) => (
                                <Badge key={level} variant="outline" className="px-3 py-1">
                                  {level.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Ma présentation & Expérience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.bio ? (
                      <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/30 p-4 rounded-md italic">
                        "{profile.bio}"
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Aucune présentation ajoutée.
                      </p>
                    )}

                    {profile?.experience && (
                      <div className="border-t pt-4">
                        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-2">Expérience professionnelle</span>
                        <p className="text-sm text-muted-foreground">
                          {profile.experience}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Actions rapides</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Gérez votre activité</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <Button variant="secondary" className="w-full justify-start gap-2 font-bold" size="sm">
                      <Calendar className="h-4 w-4" />
                      Modifier mes horaires
                    </Button>
                    <Button variant="secondary" className="w-full justify-start gap-2 font-bold" size="sm">
                      <BookOpen className="h-4 w-4" />
                      Mettre à jour mes matières
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Conseils visibilité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-green-600">1</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Une photo pro augmente vos chances de 40%.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-600">2</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Détaillez vos diplômes pour plus de crédibilité.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="grid gap-6 lg:grid-cols-[350px_1fr] h-[600px]">
              <Card className="border-none shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="border-b bg-muted/30 py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    <ConversationList 
                      currentUserId={user.id} 
                      onSelectConversation={(id, name, avatar) => setSelectedConversation({ id, name, avatar })} 
                    />
                  </div>
                </ScrollArea>
              </Card>

              <Card className="border-none shadow-sm overflow-hidden flex flex-col bg-muted/10">
                {selectedConversation ? (
                  <Chat 
                    currentUserId={user.id}
                    otherUserId={selectedConversation.id}
                    otherUserName={selectedConversation.name}
                    otherUserAvatar={selectedConversation.avatar}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="font-bold text-xl">Sélectionnez une discussion</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mt-2">
                      Choisissez un élève ou un parent dans la liste pour commencer à discuter.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="max-w-3xl mx-auto">
              <TeacherReviews teacherId={profile?.id || ""} />
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Analyse de performance</h3>
              </div>
              <TeacherStats />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </Layout>
  );
}

import { ScrollArea } from "@/components/ui/scroll-area";
