import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AtSign,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout";
import { AvatarUpload } from "@/components/avatar-upload";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDashboardPath } from "@/lib/auth-routing";
import { useToast } from "@/hooks/use-toast";
import type { Child, Parent, Student, Teacher, User } from "@shared/schema";

interface SettingsData {
  user: User;
  profile: Student | Parent | Teacher | null;
  children?: Child[] | null;
}

function getRoleLabel(role: User["role"]) {
  switch (role) {
    case "admin":
      return "Administrateur";
    case "teacher":
      return "Professeur";
    case "parent":
      return "Parent";
    case "student":
      return "Élève";
    default:
      return role;
  }
}

function getProfileName(data?: SettingsData) {
  const profile = data?.profile;
  if (profile && "firstName" in profile) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  return data?.user.email || data?.user.phone || "Mon profil";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getDefaultHeadline(data?: SettingsData) {
  if (!data?.user) return "";
  if (data.user.role === "teacher" && data.profile && "subjects" in data.profile) {
    return `Professeur de ${data.profile.subjects.split(",")[0]?.trim() || "soutien scolaire"}`;
  }
  if (data.user.role === "student" && data.profile && "level" in data.profile) {
    return `Élève en ${data.profile.level}`;
  }
  if (data.user.role === "parent") {
    return "Parent engagé dans la réussite scolaire";
  }
  return getRoleLabel(data.user.role);
}

function getInfoItems(data?: SettingsData) {
  const profile = data?.profile;
  const children = data?.children || [];
  const items: Array<{ icon: typeof MapPin; label: string; value: string }> = [];

  if (profile && "city" in profile) {
    items.push({ icon: MapPin, label: "Ville", value: profile.city });
  }
  if (profile && "level" in profile) {
    items.push({ icon: GraduationCap, label: "Niveau", value: profile.level });
  }
  if (profile && "subjects" in profile) {
    items.push({ icon: BookOpen, label: "Matières", value: profile.subjects });
  }
  if (profile && "address" in profile) {
    items.push({ icon: MapPin, label: "Adresse", value: profile.address });
  }
  if (children.length > 0) {
    items.push({ icon: Users, label: "Enfants", value: `${children.length} enfant${children.length > 1 ? "s" : ""}` });
  }

  return items;
}

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  const { data, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const name = getProfileName(data);
  const fallbackHeadline = getDefaultHeadline(data);
  const previewHeadline = headline.trim() || fallbackHeadline;
  const previewBio =
    bio.trim() ||
    "Présentez votre parcours, vos objectifs ou votre manière de travailler. Cette présentation aide les autres utilisateurs à mieux vous connaître.";
  const infoItems = useMemo(() => getInfoItems(data), [data]);

  useEffect(() => {
    if (!data?.user) return;
    setHeadline(data.user.profileHeadline || getDefaultHeadline(data));
    setBio(data.user.profileBio || "");
  }, [data]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/user/profile", {
        profileHeadline: headline,
        profileBio: bio,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData<SettingsData | undefined>(["/api/user"], (current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                profileHeadline: headline.trim() || null,
                profileBio: bio.trim() || null,
              },
            }
          : current
      );
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Votre présentation a été enregistrée.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre profil.",
        variant: "destructive",
      });
    },
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

  return (
    <Layout showFooter={false}>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Profil personnel
            </div>
            <h1 className="text-3xl font-bold tracking-normal">Paramètres du profil</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Gérez votre photo, votre présentation et l'image professionnelle visible dans votre espace.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(getDashboardPath(data.user.role))}>
            Retour à mon espace
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="overflow-hidden">
            <div className="h-36 bg-[linear-gradient(135deg,#14532d_0%,#0f766e_48%,#f59e0b_100%)]" />
            <CardContent className="-mt-12 pb-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                  <AvatarImage src={data.user.avatarUrl || ""} alt={name} />
                  <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                    {getInitials(name) || <UserRound className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-2xl font-bold">{name}</h2>
                    {data.user.isVerified && (
                      <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                        <ShieldCheck className="h-3 w-3" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-primary">{previewHeadline}</p>
                  <Badge variant="outline" className="mt-3">
                    {getRoleLabel(data.user.role)}
                  </Badge>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <section>
                  <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Présentation</h3>
                  <p className="whitespace-pre-line rounded-md border bg-muted/35 p-4 leading-7">
                    {previewBio}
                  </p>
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-md border p-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="truncate text-sm font-medium">{data.user.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-md border p-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p className="truncate text-sm font-medium">{data.user.phone}</p>
                    </div>
                  </div>
                  {infoItems.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="flex items-center gap-3 rounded-md border p-3">
                      <item.icon className="h-4 w-4 text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="truncate text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-primary" />
                  Photo de profil
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <AvatarUpload userId={data.user.id} currentAvatarUrl={data.user.avatarUrl} />
                <div className="space-y-1">
                  <p className="font-medium">Ajoutez une photo claire et professionnelle.</p>
                  <p className="text-sm text-muted-foreground">
                    Une photo de profil rend votre compte plus identifiable et inspire davantage confiance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Présentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="profileHeadline">Titre court</Label>
                  <Input
                    id="profileHeadline"
                    value={headline}
                    maxLength={120}
                    onChange={(event) => setHeadline(event.target.value)}
                    placeholder="Ex. Professeur de mathématiques, parent engagé, élève en terminale"
                    data-testid="input-profile-headline"
                  />
                  <p className="text-xs text-muted-foreground">{headline.length}/120 caractères</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileBio">Votre présentation</Label>
                  <Textarea
                    id="profileBio"
                    value={bio}
                    maxLength={1200}
                    onChange={(event) => setBio(event.target.value)}
                    className="min-h-[220px]"
                    placeholder="Présentez-vous en quelques lignes : votre parcours, vos objectifs, votre façon de travailler, vos attentes..."
                    data-testid="textarea-profile-bio"
                  />
                  <p className="text-xs text-muted-foreground">{bio.length}/1200 caractères</p>
                </div>

                <div className="rounded-md border bg-muted/35 p-4 text-sm text-muted-foreground">
                  <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Conseil
                  </div>
                  Écrivez une présentation simple, claire et humaine. Mentionnez ce que vous faites, ce que vous cherchez,
                  et ce qui vous rend fiable.
                </div>

                <Button
                  className="w-full gap-2 sm:w-auto"
                  onClick={() => updateProfileMutation.mutate()}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer mon profil
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AtSign className="h-5 w-5 text-primary" />
                  Compte
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Statut</p>
                  <p className="font-medium">{data.user.status}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Type de compte</p>
                  <p className="font-medium">{getRoleLabel(data.user.role)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Email</p>
                  <p className="break-words font-medium">{data.user.email || "-"}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{data.user.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
}
