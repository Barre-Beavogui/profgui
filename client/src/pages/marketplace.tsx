import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  FileText,
  ShoppingBag,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  GraduationCap,
  Store,
  CheckCircle2,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PREFECTURES } from "@/lib/geography";
import { SUB_PREFECTURES } from "@/lib/subPrefectures";

const categories = [
  {
    id: "formation" as const,
    title: "Formations",
    icon: GraduationCap,
    description: "Cours en ligne et en présentiel proposés par des professionnels et organisations.",
    items: ["Cours particuliers", "Formations professionnelles", "Ateliers thématiques"],
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "document" as const,
    title: "Documents & Livres",
    icon: FileText,
    description: "Brochures, livres numériques, corrigés, fiches de révision, et contenus PDF.",
    items: ["Annales corrigées", "Guides de révision", "Manuels scolaires"],
    color: "bg-green-500/10 text-green-600",
  },
  {
    id: "materiel" as const,
    title: "Matériel éducatif",
    icon: ShoppingBag,
    description: "Fournitures, outils pédagogiques, kits, équipements scolaires et supports.",
    items: ["Kits scientifiques", "Fournitures scolaires", "Outils didactiques"],
    color: "bg-purple-500/10 text-purple-600",
  },
];

const CONTACT_WHATSAPP = "+224629516388";
const CONTACT_PHONE = "+224629516388";
const CONTACT_EMAIL = "contact@profgui.com";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]["id"] | null>(null);
  const [prefecture, setPrefecture] = useState<string>("Conakry");
  const [subPrefecture, setSubPrefecture] = useState<string>("all");

  const availableSubPrefs = useMemo(() => {
    return SUB_PREFECTURES.filter((sp) => 
      sp.prefecture.toLowerCase() === prefecture.toLowerCase()
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [prefecture]);

  useEffect(() => {
    setSubPrefecture("all");
  }, [prefecture]);

  return (
    <Layout>
      <div className="bg-muted/30 pb-12">
        {/* Hero Section */}
        <section className="bg-primary px-4 py-12 text-primary-foreground md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Store className="h-8 w-8" />
              </div>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                Marketplace Éducation
              </h1>
              <p className="max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
                Trouvez tout ce dont vous avez besoin pour réussir : formations, documents, livres et matériel éducatif.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {/* Filtering Section */}
          <div className="-mt-8 mb-12">
            <Card className="border-none shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="grid gap-6 md:grid-cols-3 md:items-end">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Zone géographique
                    </label>
                    <Select value={prefecture} onValueChange={setPrefecture}>
                      <SelectTrigger className="h-12 border-muted-foreground/20">
                        <SelectValue placeholder="Sélectionnez une préfecture" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREFECTURES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Sous-préfecture
                    </label>
                    <Select 
                      value={subPrefecture} 
                      onValueChange={setSubPrefecture}
                      disabled={availableSubPrefs.length === 0}
                    >
                      <SelectTrigger className="h-12 border-muted-foreground/20">
                        <SelectValue placeholder="Toutes les zones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les zones</SelectItem>
                        {availableSubPrefs.map((sp) => (
                          <SelectItem key={sp.name} value={sp.name}>
                            {sp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex h-12 items-center px-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-bold text-primary">{PREFECTURES.length}</span> préfectures et <span className="font-bold text-primary">{SUB_PREFECTURES.length}</span> sous-préfectures couvertes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <Card 
                  key={category.id} 
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                >
                  <CardHeader className="pb-4">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${category.color}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{category.title}</CardTitle>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="mb-6 space-y-2">
                      {category.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant={isSelected ? "default" : "outline"} 
                      className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Voir les offres
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Publishing Section */}
          <section className="relative overflow-hidden rounded-3xl bg-card border shadow-sm">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/5 [mask-image:linear-gradient(to_left,white,transparent)]" />
            
            <div className="relative grid gap-12 p-8 md:grid-cols-2 md:p-12 lg:p-16">
              <div className="space-y-6">
                <Badge className="px-3 py-1 text-sm font-semibold uppercase tracking-wider">
                  Vendre sur ProfGui
                </Badge>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Vous souhaitez publier ou vendre ?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Que vous soyez un professionnel, une organisation ou un enseignant, nous vous aidons à diffuser vos formations et matériels éducatifs.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground uppercase">
                      1
                    </div>
                    <p className="text-sm font-medium">Contactez notre équipe de validation</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground uppercase">
                      2
                    </div>
                    <p className="text-sm font-medium">Contrôle qualité et vérification des contenus</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground uppercase">
                      3
                    </div>
                    <p className="text-sm font-medium">Mise en ligne et gestion de la livraison par zone</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                <Card className="bg-muted/50 border-none">
                  <CardContent className="p-6">
                    <h3 className="mb-6 text-xl font-bold">Nous contacter</h3>
                    <div className="grid gap-4">
                      <a 
                        href={`https://wa.me/${CONTACT_WHATSAPP.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:bg-green-50 hover:shadow-md dark:bg-background dark:hover:bg-green-950/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40">
                            <SiWhatsapp className="h-5 w-5" />
                          </div>
                          <span className="font-semibold">WhatsApp ProfGui</span>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                      </a>

                      <a 
                        href={`tel:${CONTACT_PHONE}`}
                        className="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:bg-blue-50 hover:shadow-md dark:bg-background dark:hover:bg-blue-950/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40">
                            <Phone className="h-5 w-5" />
                          </div>
                          <span className="font-semibold">Appeler</span>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                      </a>

                      <a 
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="group flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-all hover:bg-red-50 hover:shadow-md dark:bg-background dark:hover:bg-red-950/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40">
                            <Mail className="h-5 w-5" />
                          </div>
                          <span className="font-semibold">Email</span>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Footer Quick Access */}
          <div className="mt-20 border-t pt-10">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Retour à l'accueil
                </Link>
                <Link href="/devenir-professeur" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Devenir professeur
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                ProfGui &copy; {new Date().getFullYear()} - Marketplace Éducation Guinée
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
