import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, ChevronRight, ShieldCheck, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Teacher, User } from "@shared/schema";

interface TeacherWithUser extends Teacher {
  user: User;
}

function getTeacherHeadline(teacher: TeacherWithUser) {
  return teacher.user.profileHeadline || `Professeur de ${teacher.subjects.split(",")[0]?.trim() || "soutien scolaire"}`;
}

export function TopTeachers() {
  const { data: teachers, isLoading } = useQuery<TeacherWithUser[]>({
    queryKey: ["/api/teachers"],
  });

  const topTeachers = teachers
    ?.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
    .slice(0, 3);

  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/30 text-primary bg-primary/5">
              Qualité certifiée
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Les professeurs les mieux notés
            </h2>
            <p className="text-muted-foreground text-lg">
              Découvrez les enseignants qui font la différence. Sélectionnés pour leur expertise et leur pédagogie.
            </p>
          </div>
          <Link href="/trouver-professeur">
            <Button variant="outline" className="group rounded-xl border-2 font-bold h-12">
              Voir tout le réseau
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-[2.5rem] border-none shadow-sm">
                <CardContent className="p-8">
                  <Skeleton className="h-24 w-24 rounded-3xl mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : topTeachers?.map((teacher) => (
            <Card 
              key={teacher.id} 
              className="group relative overflow-hidden rounded-[2.5rem] border-none bg-muted/30 transition-all duration-500 hover:shadow-2xl hover:bg-background hover:-translate-y-2"
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <Avatar className="h-24 w-24 rounded-3xl border-4 border-background shadow-xl">
                      <AvatarImage src={teacher.user.avatarUrl || ""} />
                      <AvatarFallback className="bg-primary/10 text-2xl font-black text-primary">
                        {teacher.firstName[0]}{teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {teacher.user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary border-4 border-background flex items-center justify-center text-white">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-yellow-500 mb-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-bold text-sm">{teacher.averageRating || "5.0"}</span>
                    <span className="text-muted-foreground text-xs ml-1">({teacher.totalReviews || 0} avis)</span>
                  </div>

                  <h3 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <p className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-primary">
                    {getTeacherHeadline(teacher)}
                  </p>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-3 w-3" />
                    <span>{teacher.city}</span>
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                    {teacher.subjects.split(",").slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary" className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-background text-foreground border-none">
                        {s.trim()}
                      </Badge>
                    ))}
                  </div>

                  <Link href={`/professeurs/${teacher.id}`}>
                    <Button className="w-full rounded-2xl font-bold h-11 shadow-lg shadow-primary/10">
                      Consulter le profil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-[2.5rem] bg-primary text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold italic">"Une réussite garantie avec les meilleurs."</h4>
              <p className="opacity-80 text-sm">Déjà plus de 500 élèves accompagnés en Guinée.</p>
            </div>
          </div>
          <Link href="/inscription">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl h-14 px-8">
              S'inscrire maintenant
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
