import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Headphones,
  Home as HomeIcon,
  Monitor,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Hero } from "@/components/hero";
import { MarketplaceTeaser } from "@/components/marketplace-teaser";
import { TopTeachers } from "@/components/top-teachers";
import { HowItWorks } from "@/components/how-it-works";
import { Testimonials } from "@/components/testimonials";
import { CTASection } from "@/components/cta-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const solutions = [
  {
    icon: HomeIcon,
    title: "Cours particuliers à domicile",
    description:
      "Un professeur validé accompagne l'élève chez lui, avec un rythme adapté à ses objectifs.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    href: "/trouver-professeur?type=domicile",
  },
  {
    icon: Monitor,
    title: "Cours en ligne encadrés",
    description:
      "Une solution flexible pour continuer les cours à distance, tout en gardant un suivi ProfGui.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    href: "/trouver-professeur?type=en-ligne",
  },
  {
    icon: Headphones,
    title: "Accompagnement des familles",
    description:
      "ProfGui centralise les demandes, suit les comptes et garde une vision claire côté administration.",
    image: "/images/profgui-student-white-shirt.jpeg",
    href: "/inscription?role=parent",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Professeurs contrôlés",
    description: "Les profils non approuvés ou suspendus ne sont pas visibles publiquement.",
  },
  {
    icon: CalendarCheck,
    title: "Demandes suivies",
    description: "Réservations, statuts et notifications restent consultables depuis les tableaux de bord.",
  },
  {
    icon: Users,
    title: "Rôles respectés",
    description: "Chaque parent, élève, professeur et administrateur voit son propre environnement.",
  },
];

function SolutionsSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-emerald-700/30 bg-emerald-50 text-emerald-800">
              Solutions de soutien scolaire
            </Badge>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">
              Un parcours simple pour démarrer les cours
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              La page publique met en avant les formats de cours, puis renvoie
              vers les vrais profils et demandes enregistrées dans ProfGui.
            </p>
          </div>
          <Link href="/trouver-professeur">
            <Button variant="outline" className="h-12 gap-2 rounded-md font-bold">
              Voir les professeurs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {solutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <article key={solution.title} className="overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <img
                  src={solution.image}
                  alt=""
                  className="h-48 w-full object-cover object-top"
                  loading="lazy"
                />
                <div className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-700 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-black">{solution.title}</h3>
                  <p className="mt-3 min-h-[5rem] text-sm leading-6 text-muted-foreground">
                    {solution.description}
                  </p>
                  <Link href={solution.href}>
                    <Button variant="link" className="mt-4 h-auto gap-2 p-0 font-black text-emerald-800">
                      Commencer
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ManagedExperienceSection() {
  return (
    <section className="bg-slate-950 py-16 text-white md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1100&q=82"
            alt=""
            className="h-[420px] w-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <Badge className="mb-4 bg-amber-400 text-slate-950 hover:bg-amber-400">
            Fonctionnement ProfGui
          </Badge>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">
            Une plateforme visible, mais un suivi maîtrisé
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/78">
            Les familles consultent les disponibilités et les profils, puis la
            demande passe par ProfGui. L'administrateur garde la visibilité sur
            les professeurs, les élèves, les parents, les réservations et les
            échanges importants.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {guarantees.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-white/12 bg-white/8 p-4">
                  <Icon className="mb-4 h-6 w-6 text-amber-300" />
                  <h3 className="font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/inscription">
              <Button className="h-12 gap-2 rounded-md bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
                Créer un compte
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/connexion">
              <Button variant="outline" className="h-12 gap-2 rounded-md border-white/30 bg-transparent font-black text-white hover:bg-white/10">
                Accéder à mon espace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubjectStrip() {
  const subjects = ["Mathématiques", "Français", "Anglais", "Physique", "SVT", "Informatique", "Primaire", "Collège", "Lycée"];

  return (
    <section className="border-y bg-amber-50 py-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:px-8">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-amber-900">
          <BookOpen className="h-4 w-4" />
          Matières demandées
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <Link key={subject} href={`/trouver-professeur?q=${encodeURIComponent(subject)}`}>
              <span className="inline-flex rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-950 transition hover:border-emerald-700 hover:text-emerald-800">
                {subject}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout>
      <Hero />
      <SubjectStrip />
      <SolutionsSection />
      <TopTeachers />
      <ManagedExperienceSection />
      <HowItWorks />
      <Testimonials />
      <MarketplaceTeaser />
      <CTASection />
    </Layout>
  );
}
