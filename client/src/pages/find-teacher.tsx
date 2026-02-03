import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, BookOpen, Phone, Filter, X, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { EDUCATION_LEVELS, SUBJECTS, CITIES, ADMIN_WHATSAPP, type Teacher, type User } from "@shared/schema";

interface TeacherWithUser extends Teacher {
  user: User;
}

export default function FindTeacher() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: teachers, isLoading } = useQuery<TeacherWithUser[]>({
    queryKey: ["/api/teachers", { city: selectedCity, subject: selectedSubject, level: selectedLevel, search: searchTerm }],
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedSubject("");
    setSelectedLevel("");
  };

  const hasFilters = searchTerm || selectedCity || selectedSubject || selectedLevel;

  const filteredTeachers = teachers?.filter((teacher) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
      if (!fullName.includes(search)) return false;
    }
    return true;
  });

  return (
    <Layout>
      <div className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              Trouver un professeur
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Recherchez parmi nos professeurs qualifiés. Pour vous inscrire à un cours, contactez notre administrateur.
            </p>
          </div>

          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold">Vous souhaitez prendre des cours ?</h3>
                <p className="text-sm text-muted-foreground">
                  Contactez notre administrateur pour être mis en relation avec un professeur.
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="gap-2 bg-green-600 hover:bg-green-700" data-testid="button-contact-admin-whatsapp">
                    <SiWhatsapp className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
                <a href={`tel:${ADMIN_WHATSAPP}`}>
                  <Button variant="outline" className="gap-2" data-testid="button-contact-admin-phone">
                    <Phone className="h-4 w-4" />
                    Appeler
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un professeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-teacher"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2 sm:w-auto"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4" />
                Filtres
                {hasFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {[selectedCity, selectedSubject, selectedLevel].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">Ville</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger data-testid="select-filter-city">
                          <SelectValue placeholder="Toutes les villes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les villes</SelectItem>
                          {CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">Matière</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger data-testid="select-filter-subject">
                          <SelectValue placeholder="Toutes les matières" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les matières</SelectItem>
                          {SUBJECTS.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">Niveau</label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger data-testid="select-filter-level">
                          <SelectValue placeholder="Tous les niveaux" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les niveaux</SelectItem>
                          {EDUCATION_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {hasFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-1 text-muted-foreground"
                        data-testid="button-clear-filters"
                      >
                        <X className="h-4 w-4" />
                        Effacer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTeachers && filteredTeachers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">Aucun professeur trouvé</h3>
              <p className="text-muted-foreground">
                {hasFilters
                  ? "Essayez de modifier vos critères de recherche."
                  : "Aucun professeur n'est disponible pour le moment."}
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="mt-4" data-testid="button-clear-filters-empty">
                  Effacer les filtres
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TeacherCard({ teacher }: { teacher: TeacherWithUser }) {
  const subjects = teacher.subjects.split(",").slice(0, 3);
  const initials = `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`;

  return (
    <Card className="hover-elevate" data-testid={`card-teacher-${teacher.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="truncate font-semibold text-lg">
              {teacher.firstName} {teacher.lastName}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{teacher.city}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {subjects.map((subject) => (
            <Badge key={subject} variant="secondary" className="text-xs">
              {subject.trim()}
            </Badge>
          ))}
          {teacher.subjects.split(",").length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{teacher.subjects.split(",").length - 3}
            </Badge>
          )}
        </div>

        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Diplôme:</span> {teacher.diploma}
          </div>
          <div>
            <span className="font-medium">Niveaux:</span> {teacher.levels.split(",").slice(0, 2).join(", ")}
            {teacher.levels.split(",").length > 2 && "..."}
          </div>
        </div>

        {teacher.bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {teacher.bio}
          </p>
        )}

        <div className="mt-4 rounded-md bg-muted/50 p-3 text-center text-sm">
          <MessageCircle className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Contactez l'administrateur pour être mis en relation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
