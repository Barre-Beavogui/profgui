import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Headphones,
  Home,
  MapPin,
  Monitor,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WHATSAPP_NUMBER = "+224629516388";
const PHONE_NUMBER = "+224629516388";

const cities = ["Conakry", "Kankan", "Kindia", "Labé", "Nzérékoré", "Mamou"];
const levels = ["Primaire", "Collège", "Lycée", "Supérieur", "Adulte"];
const subjects = [
  "Mathématiques",
  "Français",
  "Physique-Chimie",
  "Anglais",
  "SVT",
  "Informatique",
];

export function Hero() {
  const [, navigate] = useLocation();
  const [courseType, setCourseType] = useState<"home" | "online">("home");
  const [city, setCity] = useState("");
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (level) params.set("level", level);
    if (subject) params.set("subject", subject);
    if (query.trim()) params.set("q", query.trim());
    params.set("type", courseType === "home" ? "domicile" : "en-ligne");

    const queryString = params.toString();
    navigate(`/trouver-professeur${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <section className="bg-background">
      <div className="relative min-h-[690px] overflow-hidden bg-emerald-950">
        <div className="absolute inset-0">
          <img
            src="/images/profgui-student-white-shirt.jpeg"
            alt=""
            className="h-full w-full object-contain object-top md:object-cover md:object-[50%_18%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/96 via-emerald-950/86 to-slate-950/68" />
          <div className="absolute inset-0 bg-emerald-950/46 md:hidden" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-[430px] md:px-8 md:py-16 lg:py-20">
          <div className="space-y-10">
            <div className="max-w-4xl text-white">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-white/14 px-3 py-2 text-sm font-semibold backdrop-blur">
                <Award className="h-4 w-4 text-amber-300" />
                Soutien scolaire suivi par ProfGui
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.04] md:text-5xl xl:text-6xl">
                Des cours particuliers encadrés avec des professeurs validés
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/88 md:text-xl">
                ProfGui aide les familles à trouver le bon professeur en Guinée:
                profil vérifié, demande centralisée, suivi administratif et cours
                à domicile ou en ligne.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={`tel:${PHONE_NUMBER}`}>
                  <Button size="lg" className="w-full gap-2 bg-amber-400 text-emerald-950 hover:bg-amber-300 sm:w-auto">
                    <Phone className="h-4 w-4" />
                    Besoin d'un conseil
                  </Button>
                </a>
                <Link href="/devenir-professeur">
                  <Button size="lg" variant="secondary" className="w-full gap-2 bg-white text-emerald-950 hover:bg-white/92 sm:w-auto">
                    Devenir professeur
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

            </div>

            <form
              onSubmit={handleSearch}
              className="max-w-4xl rounded-lg border border-white/18 bg-white p-4 shadow-2xl md:p-6"
              data-testid="hero-search-form"
            >
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Trouver un professeur
                </p>
                <h2 className="mt-1 text-2xl font-black text-foreground">
                  Dites-nous votre besoin
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  ProfGui vous oriente vers les profils adaptés à votre ville,
                  votre niveau et votre matière.
                </p>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setCourseType("home")}
                  className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-bold transition ${
                    courseType === "home"
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Domicile
                </button>
                <button
                  type="button"
                  onClick={() => setCourseType("online")}
                  className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-bold transition ${
                    courseType === "online"
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  En ligne
                </button>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    Ville
                  </label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="h-12 rounded-md">
                      <SelectValue placeholder="Choisir une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <GraduationCap className="h-4 w-4 text-emerald-700" />
                      Niveau
                    </label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger className="h-12 rounded-md">
                        <SelectValue placeholder="Classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <BookOpen className="h-4 w-4 text-emerald-700" />
                      Matière
                    </label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="h-12 rounded-md">
                        <SelectValue placeholder="Matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Search className="h-4 w-4 text-emerald-700" />
                    Recherche libre
                  </label>
                  <Input
                    name="search"
                    placeholder="Ex: maths Terminale, anglais débutant..."
                    className="h-12 rounded-md"
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                  />
                </div>

                <Button type="submit" size="lg" className="h-12 gap-2 rounded-md font-black">
                  Voir les professeurs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 grid gap-3 border-t pt-5 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  Demande centralisée par ProfGui
                </div>
                <div className="flex items-start gap-2">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                  Parent, élève ou professeur
                </div>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
              >
                <SiWhatsapp className="h-4 w-4 text-green-600" />
                Parler à ProfGui sur WhatsApp
              </a>
            </form>

            <div className="grid max-w-4xl gap-3 text-white sm:grid-cols-3">
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-amber-300">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-2xl font-black">4,8/5</span>
                </div>
                <p className="mt-1 text-sm text-white/80">Avis familles et élèves</p>
              </div>
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-200" />
                  <span className="text-2xl font-black">100%</span>
                </div>
                <p className="mt-1 text-sm text-white/80">Professeurs contrôlés</p>
              </div>
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-sky-200" />
                  <span className="text-2xl font-black">Suivi</span>
                </div>
                <p className="mt-1 text-sm text-white/80">Accompagnement par l'équipe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
