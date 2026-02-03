import { UserPlus, Search, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: UserPlus,
    title: "Inscrivez-vous",
    description:
      "Créez votre compte gratuitement en tant qu'élève, parent ou professeur. C'est simple et rapide.",
  },
  {
    icon: Search,
    title: "Trouvez le bon professeur",
    description:
      "Recherchez parmi nos professeurs qualifiés par matière, ville ou niveau. Consultez leurs profils et disponibilités.",
  },
  {
    icon: BookOpen,
    title: "Commencez les cours",
    description:
      "Contactez le professeur de votre choix par téléphone ou WhatsApp et démarrez les cours à domicile ou en ligne.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24" id="comment-ca-marche">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Trouver un professeur particulier n'a jamais été aussi simple. 
            Suivez ces 3 étapes pour commencer.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-visible border-0 bg-card shadow-md hover-elevate">
              <div className="absolute -top-6 left-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-lg">
                  {index + 1}
                </div>
              </div>
              <CardContent className="pt-10 pb-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
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
