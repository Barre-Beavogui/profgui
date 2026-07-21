import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, CalendarClock, Loader2, MapPin, ShieldCheck, Star } from "lucide-react";
import { Layout } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingDialog } from "@/components/booking-dialog";
import { TeacherReviews } from "@/components/teacher-reviews";
import type { Teacher, User } from "@shared/schema";

interface TeacherWithUser extends Teacher {
  user: Pick<User, "id" | "avatarUrl" | "profileHeadline" | "profileBio" | "isVerified" | "role" | "status">;
}

function getTeacherHeadline(teacher: TeacherWithUser) {
  return teacher.user.profileHeadline || `Professeur de ${teacher.subjects.split(",")[0]?.trim() || "soutien scolaire"}`;
}

function getTeacherPresentation(teacher: TeacherWithUser) {
  return teacher.user.profileBio || teacher.bio || "Ce professeur n'a pas encore ajouté de présentation détaillée.";
}

function courseTypeLabel(type: string) {
  if (type === "domicile") return "À domicile";
  if (type === "en_ligne") return "En ligne";
  return "À domicile ou en ligne";
}

export default function TeacherProfilePage() {
  const [, params] = useRoute<{ id: string }>("/professeurs/:id");
  const teacherId = params?.id || "";
  const { data: teacher, isLoading } = useQuery<TeacherWithUser>({
    queryKey: [`/api/teachers/${teacherId}`],
    enabled: !!teacherId,
  });
  const { data: userData } = useQuery<{ user: User }>({
    queryKey: ["/api/user"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <Layout>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">Professeur introuvable</h1>
          <p className="mt-3 text-muted-foreground">Ce profil n'est pas visible ou n'a pas encore été approuvé.</p>
          <Link href="/trouver-professeur">
            <Button className="mt-6">Voir les professeurs</Button>
          </Link>
        </main>
      </Layout>
    );
  }

  const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`;

  return (
    <Layout>
      <main className="bg-muted/20">
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
            <Link href="/trouver-professeur">
              <Button variant="ghost" className="mb-6">Retour aux professeurs</Button>
            </Link>
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-6 sm:flex-row">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={teacher.user.avatarUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-3xl font-black text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-4xl font-black tracking-normal">{teacher.firstName} {teacher.lastName}</h1>
                    {teacher.user.isVerified && (
                      <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                        <ShieldCheck className="h-3 w-3" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-lg font-semibold text-primary">{getTeacherHeadline(teacher)}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-3 py-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      {teacher.city}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-3 py-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {teacher.averageRating || "0.0"} ({teacher.totalReviews || 0} avis)
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-3 py-1">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      {courseTypeLabel(teacher.courseType)}
                    </span>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="space-y-3 p-5">
                  <BookingDialog teacher={teacher} triggerClassName="w-full gap-2" />
                  <div className="rounded-md border border-primary/10 bg-primary/5 p-3 text-sm text-muted-foreground">
                    ProfGui vérifie les disponibilités et sert d'intermédiaire avant toute mise en relation.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Présentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line leading-7 text-muted-foreground">{getTeacherPresentation(teacher)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compétences enseignées</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Matières
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.split(",").map((subject) => (
                      <Badge key={subject} variant="secondary">{subject.trim()}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Award className="h-4 w-4 text-primary" />
                    Niveaux
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {teacher.levels.split(",").map((level) => (
                      <Badge key={level} variant="outline">{level.trim()}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avis</CardTitle>
              </CardHeader>
              <CardContent>
                <TeacherReviews teacherId={teacher.id} currentUserId={userData?.user?.id} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Disponibilités</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{teacher.availability}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diplôme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{teacher.diploma}</p>
                {teacher.experience && <p className="mt-3 text-sm text-muted-foreground">{teacher.experience}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cadre ProfGui</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Les familles consultent librement le profil et les disponibilités. Les échanges et confirmations de cours sont ensuite coordonnés par l'administration ProfGui.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </Layout>
  );
}
