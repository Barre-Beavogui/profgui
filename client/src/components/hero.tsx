import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES, SUBJECTS } from "@shared/schema";

const ANY = "all";

export function Hero() {
  const [, navigate] = useLocation();
  const [subject, setSubject] = useState<string>(ANY);
  const [city, setCity] = useState<string>(ANY);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (subject !== ANY) params.set("matiere", subject);
    if (city !== ANY) params.set("ville", city);
    const qs = params.toString();
    navigate(`/trouver-professeur${qs ? `?${qs}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.07] via-background to-background">
      {/* Décor */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[420px] w-[420px] rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-sm font-medium text-primary shadow-xs backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Soutien scolaire partout en Guinée
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Le bon professeur,{" "}
              <span className="relative whitespace-nowrap text-primary">
                près de chez vous
                <svg
                  aria-hidden
                  viewBox="0 0 300 12"
                  className="absolute -bottom-2 left-0 h-3 w-full text-amber-400"
                  preserveAspectRatio="none"
                >
                  <path d="M2 9C60 3 140 2 298 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
              .
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Des professeurs vérifiés pour réussir à l'école, du primaire à l'université. Cours à domicile
              ou en ligne, de Conakry à N'Zérékoré.
            </p>

            <form
              onSubmit={onSearch}
              className="flex max-w-2xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-lg sm:flex-row sm:items-center"
              data-testid="form-hero-search"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 sm:border-r sm:rounded-none">
                <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="h-11 border-0 px-1 shadow-none focus:ring-0" aria-label="Matière">
                    <SelectValue placeholder="Matière" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Toutes les matières</SelectItem>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-1 items-center gap-2 px-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-11 border-0 px-1 shadow-none focus:ring-0" aria-label="Ville">
                    <SelectValue placeholder="Ville" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Toute la Guinée</SelectItem>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="lg" className="h-12 gap-2 rounded-xl px-6" data-testid="button-find-teacher-hero">
                <Search className="h-4 w-4" />
                Rechercher
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Profils vérifiés par notre équipe
              </span>
              <span className="flex items-center gap-2">
                <HomeIcon className="h-4 w-4 text-primary" /> À domicile ou en ligne
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" /> Contact direct, sans intermédiaire
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/devenir-professeur">
                <Button variant="outline" className="gap-2" data-testid="button-become-teacher-hero">
                  Vous êtes professeur ? Rejoignez-nous
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="ghost" className="gap-2 text-muted-foreground">
                  Voir le marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Illustration : aperçu d'un profil */}
          <div className="relative mx-auto hidden w-full max-w-md lg:block">
            <div className="absolute -top-8 right-4 z-10 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <CalendarCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">Cours confirmé</div>
                <div className="text-xs text-muted-foreground">Samedi · 10h00</div>
              </div>
            </div>

            <div className="relative rotate-1 rounded-3xl border bg-card p-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-2xl font-bold text-primary-foreground shadow-md">
                  MD
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    Mamadou D.
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">Mathématiques · Physique</div>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">Exemple de profil</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Niveau", value: "Lycée" },
                  { label: "Ville", value: "Conakry" },
                  { label: "Format", value: "Les deux" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted px-2 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>

              <p className="mt-5 rounded-xl border border-dashed p-4 text-sm leading-relaxed text-muted-foreground">
                « J'accompagne les élèves de la 10ème à la Terminale pour préparer le BAC avec méthode et
                confiance. »
              </p>

              <Button className="pointer-events-none mt-5 w-full gap-2" tabIndex={-1} aria-hidden>
                <MessageCircle className="h-4 w-4" />
                Contacter le professeur
              </Button>
            </div>

            <div className="absolute -bottom-6 -left-6 flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 shadow-xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">Profil vérifié</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
