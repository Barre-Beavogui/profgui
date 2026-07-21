import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  BookOpen, 
  Filter, 
  X, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  Award, 
  Clock, 
  ChevronRight,
  Heart
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TeacherReviews } from "@/components/teacher-reviews";
import { Chat } from "@/components/chat";
import { BookingDialog } from "@/components/booking-dialog";
import { EDUCATION_LEVELS, SUBJECTS, CITIES, type Favorite, type Teacher, type User } from "@shared/schema";

interface TeacherWithUser extends Teacher {
  user: User;
}

function getTeacherHeadline(teacher: TeacherWithUser) {
  return teacher.user.profileHeadline || `Professeur de ${teacher.subjects.split(",")[0]?.trim() || "soutien scolaire"}`;
}

function getTeacherPresentation(teacher: TeacherWithUser) {
  return teacher.user.profileBio || teacher.bio || "Aucune description fournie.";
}

export default function FindTeacher() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithUser | null>(null);

  const { data: userData } = useQuery<{ user: User }>({
    queryKey: ["/api/user"],
  });

  const { data: teachers, isLoading } = useQuery<TeacherWithUser[]>({
    queryKey: ["/api/teachers"],
  });
  const { data: favorites } = useQuery<(Favorite & { teacher: TeacherWithUser | null })[]>({
    queryKey: ["/api/favorites"],
    enabled: !!userData?.user && ["student", "parent"].includes(userData.user.role),
  });
  const favoriteTeacherIds = new Set((favorites || []).map((favorite) => favorite.teacherId));

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ teacherId, isFavorite }: { teacherId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${teacherId}`);
      }
      return apiRequest("POST", "/api/favorites", { teacherId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
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
      const subjects = teacher.subjects.toLowerCase();
      if (!fullName.includes(search) && !subjects.includes(search)) return false;
    }
    if (selectedCity && selectedCity !== "all" && teacher.city !== selectedCity) return false;
    if (selectedSubject && selectedSubject !== "all" && !teacher.subjects.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
    if (selectedLevel && selectedLevel !== "all" && !teacher.levels.toLowerCase().includes(selectedLevel.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
      <div className="py-8 md:py-12 bg-muted/20 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30 text-primary bg-primary/5">
              Trouvez votre prof idéal
            </Badge>
            <h1 className="mb-4 text-4xl font-black md:text-5xl tracking-tight">
              Réussissez avec nos experts
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Accédez au plus large réseau de professeurs qualifiés en Guinée. 
              Discutez directement avec eux et réservez votre premier cours.
            </p>
          </div>

          <div className="mb-12 space-y-4 max-w-4xl mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Ex: Professeur de Mathématiques à Conakry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 rounded-2xl shadow-sm border-none focus-visible:ring-2"
                  data-testid="input-search-teacher"
                />
              </div>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                className="gap-2 h-14 px-6 rounded-2xl border-none shadow-sm"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4" />
                Filtrer
                {hasFilters && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {[selectedCity, selectedSubject, selectedLevel].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <Card className="rounded-2xl border-none shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ville</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none">
                          <SelectValue placeholder="Toutes les villes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toute la Guinée</SelectItem>
                          {CITIES.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Matière</label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none">
                          <SelectValue placeholder="Toutes les matières" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les matières</SelectItem>
                          {SUBJECTS.map((subject) => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Niveau</label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none">
                          <SelectValue placeholder="Tous les niveaux" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les niveaux</SelectItem>
                          {EDUCATION_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {hasFilters && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-2 text-muted-foreground hover:text-primary"
                        data-testid="button-clear-filters"
                      >
                        <X className="h-4 w-4" />
                        Réinitialiser tous les filtres
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="rounded-3xl border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-20 w-20 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTeachers && filteredTeachers.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher) => (
                <TeacherCard 
                  key={teacher.id} 
                  teacher={teacher} 
                  isFavorite={favoriteTeacherIds.has(teacher.id)}
                  canFavorite={!!userData?.user && ["student", "parent"].includes(userData.user.role)}
                  onToggleFavorite={() =>
                    toggleFavoriteMutation.mutate({
                      teacherId: teacher.id,
                      isFavorite: favoriteTeacherIds.has(teacher.id),
                    })
                  }
                  onSelect={() => setSelectedTeacher(teacher)} 
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-background/50 rounded-[3rem] border-2 border-dashed border-muted mx-auto max-w-2xl">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="mb-2 text-2xl font-bold">Aucun professeur trouvé</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {hasFilters
                  ? "Nous n'avons pas trouvé de prof correspondant à ces critères. Essayez d'élargir votre recherche."
                  : "Aucun professeur n'est disponible pour le moment. Revenez plus tard !"}
              </p>
              {hasFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-6 text-primary font-bold">
                  Effacer les filtres
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Teacher Detail & Interaction Dialog */}
      <Dialog open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-card">
          {selectedTeacher && (
            <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
              {/* Profile Side */}
              <div className="lg:w-1/2 overflow-y-auto border-r bg-muted/10">
                <div className="p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <Avatar className="h-24 w-24 rounded-2xl border-4 border-background shadow-lg">
                      <AvatarImage src={selectedTeacher.user.avatarUrl || ""} />
                      <AvatarFallback className="bg-primary/10 text-2xl font-black text-primary">
                        {selectedTeacher.firstName[0]}{selectedTeacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-black tracking-tight">{selectedTeacher.firstName} {selectedTeacher.lastName}</h2>
                        {selectedTeacher.user.isVerified && <ShieldCheck className="h-6 w-6 text-primary fill-primary/10" />}
                      </div>
                      <p className="mb-2 text-sm font-semibold text-primary">{getTeacherHeadline(selectedTeacher)}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-bold text-sm">{selectedTeacher.averageRating || "0.0"}</span>
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">({selectedTeacher.totalReviews || 0} avis)</span>
                        <Badge variant="secondary" className="h-5 px-2 text-[10px] uppercase font-bold tracking-tighter bg-green-100 text-green-700 border-none">
                          Réactif
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-background shadow-sm border border-primary/5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Ville</p>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        {selectedTeacher.city}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-background shadow-sm border border-primary/5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Diplôme</p>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Award className="h-4 w-4 text-primary" />
                        {selectedTeacher.diploma}
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="about" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted/50 p-1 mb-6">
                      <TabsTrigger value="about" className="rounded-lg font-bold">Présentation</TabsTrigger>
                      <TabsTrigger value="reviews" className="rounded-lg font-bold">Avis</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="about" className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          À propos de moi
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap italic bg-background p-4 rounded-2xl border border-primary/5">
                          "{getTeacherPresentation(selectedTeacher)}"
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Matières enseignées</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeacher.subjects.split(",").map(s => (
                              <Badge key={s} variant="secondary" className="px-3 py-1 bg-primary/5 border-primary/10 text-primary font-semibold">
                                {s.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Niveaux scolaires</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeacher.levels.split(",").map(l => (
                              <Badge key={l} variant="outline" className="px-3 py-1 border-muted text-muted-foreground text-[10px] font-bold">
                                {l.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Disponibilités
                        </h4>
                        <p className="text-xs text-muted-foreground">{selectedTeacher.availability}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="animate-in fade-in duration-300">
                      <TeacherReviews 
                        teacherId={selectedTeacher.id} 
                        currentUserId={userData?.user?.id} 
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Chat Side */}
              <div className="lg:w-1/2 flex flex-col bg-background">
                {userData?.user ? (
                  <div className="flex-1 flex flex-col">
                    <div className="p-6 border-b flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold">Messagerie instantanée</h3>
                        <p className="text-xs text-muted-foreground">Posez vos questions à {selectedTeacher.firstName}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Sécurisé</Badge>
                    </div>
                    <div className="border-b p-4">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <BookingDialog teacher={selectedTeacher} triggerClassName="flex-1 gap-2" />
                        <Link href={`/professeurs/${selectedTeacher.id}`} className="flex-1">
                          <Button variant="outline" className="w-full" size="lg">
                            Voir le profil public
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex-1 p-0">
                      <Chat 
                        currentUserId={userData.user.id}
                        otherUserId={selectedTeacher.userId}
                        otherUserName={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                        otherUserAvatar={selectedTeacher.user.avatarUrl}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                      <MessageCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Connectez-vous pour discuter</h3>
                    <p className="text-muted-foreground mb-8 max-w-xs">
                      Vous devez être connecté pour envoyer un message direct à ce professeur.
                    </p>
                    <div className="flex flex-col w-full gap-3">
                      <Link href="/connexion">
                        <Button className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">Se connecter</Button>
                      </Link>
                      <Link href="/inscription">
                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-none bg-muted/50">Créer un compte</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function TeacherCard({
  teacher,
  onSelect,
  isFavorite,
  canFavorite,
  onToggleFavorite,
}: {
  teacher: TeacherWithUser;
  onSelect: () => void;
  isFavorite?: boolean;
  canFavorite?: boolean;
  onToggleFavorite: () => void;
}) {
  const subjects = teacher.subjects.split(",").slice(0, 3);
  const initials = `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`;

  return (
    <Card 
      className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-background/60 backdrop-blur-md cursor-pointer"
      onClick={onSelect}
    >
      <div className="absolute top-0 right-0 p-6 z-10">
        <button
          className={`h-10 w-10 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center transition-all ${
            isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-500"
          } ${canFavorite ? "hover:bg-white" : "opacity-50"}`}
          onClick={(event) => {
            event.stopPropagation();
            if (canFavorite) onToggleFavorite();
          }}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4 group-hover:scale-105 transition-transform duration-500">
            <Avatar className="h-24 w-24 rounded-3xl border-4 border-background shadow-xl">
              <AvatarImage src={teacher.user.avatarUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-2xl font-black text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {teacher.user.isVerified && (
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary border-4 border-background flex items-center justify-center text-white shadow-lg">
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">
            {teacher.firstName} {teacher.lastName}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-primary">
            {getTeacherHeadline(teacher)}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium mt-1">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{teacher.city}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-bold">{teacher.averageRating || "0.0"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-bold">({teacher.totalReviews || 0} avis)</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-1.5">
            {subjects.map((subject) => (
              <Badge key={subject} variant="secondary" className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-primary/5 text-primary border-none">
                {subject.trim()}
              </Badge>
            ))}
            {teacher.subjects.split(",").length > 3 && (
              <Badge variant="outline" className="px-2 py-0.5 rounded-full text-[10px] font-bold border-muted text-muted-foreground">
                +{teacher.subjects.split(",").length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 group-hover:bg-primary/5 transition-colors">
            <div className="text-center flex-1 border-r border-muted/50 px-2">
              <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground mb-0.5">Expérience</p>
              <p className="text-xs font-black">{teacher.yearsOfExperience || 0} ans</p>
            </div>
            <div className="text-center flex-1 px-2">
              <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground mb-0.5">Taux réponse</p>
              <p className="text-xs font-black text-green-600">{teacher.responseRate || 100}%</p>
            </div>
          </div>

          <Button className="w-full h-12 rounded-2xl font-bold gap-2 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
            <MessageCircle className="h-4 w-4" />
            Voir et réserver
            <ChevronRight className="h-4 w-4 ml-auto opacity-30" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
