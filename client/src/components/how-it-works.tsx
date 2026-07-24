import { CalendarCheck, Search, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: UserPlus,
    title: "Créez votre espace",
    description:
      "Parent, élève ou professeur: chaque rôle dispose d'un environnement dédié après connexion.",
  },
  {
    icon: Search,
    title: "Choisissez votre besoin",
    description:
      "Recherchez par ville, matière ou niveau, puis consultez uniquement les profils validés.",
  },
  {
    icon: CalendarCheck,
    title: "Envoyez une demande",
    description:
      "La réservation, le statut et les notifications sont suivis dans ProfGui jusqu'au cours.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24" id="comment-ca-marche">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Comment ProfGui organise les cours ?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Un fonctionnement lisible pour les familles, les élèves, les professeurs
            et l'administration.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-visible rounded-lg border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute -top-6 left-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-xl font-bold text-primary-foreground shadow-lg">
                  {index + 1}
                </div>
              </div>
              <CardContent className="pt-10 pb-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-primary/10">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
