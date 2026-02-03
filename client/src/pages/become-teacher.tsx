import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Users, Clock, BadgeCheck, Wallet } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Accès aux élèves",
    description: "Connectez-vous avec des centaines de familles à la recherche de professeurs qualifiés.",
  },
  {
    icon: Clock,
    title: "Flexibilité",
    description: "Choisissez vos horaires et le type de cours (domicile ou en ligne).",
  },
  {
    icon: BadgeCheck,
    title: "Profil vérifié",
    description: "Un badge de vérification qui rassure les parents et augmente votre crédibilité.",
  },
  {
    icon: Wallet,
    title: "Revenus supplémentaires",
    description: "Fixez vos propres tarifs et augmentez vos revenus grâce aux cours particuliers.",
  },
];

const steps = [
  "Créez votre compte en remplissant le formulaire d'inscription",
  "Notre équipe examine votre profil et vos qualifications",
  "Une fois validé, votre profil apparaît sur la plateforme",
  "Les familles vous contactent directement par téléphone ou WhatsApp",
];

export default function BecomeTeacher() {
  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Devenez professeur sur{" "}
                <span className="text-primary">ProfGui</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Rejoignez notre communauté de professeurs et partagez vos connaissances 
                avec des élèves motivés partout en Guinée.
              </p>
              <Link href="/inscription?role=teacher">
                <Button size="lg" className="gap-2" data-testid="button-register-teacher">
                  S'inscrire maintenant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -right-4 -top-4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
              <Card className="relative">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {index + 1}
                        </div>
                        <p className="text-sm pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Pourquoi enseigner avec ProfGui ?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Des avantages concrets pour développer votre activité d'enseignant.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Ce que nous recherchons</h2>
              <div className="space-y-4">
                {[
                  "Un diplôme ou une expertise dans votre domaine",
                  "De la passion pour l'enseignement",
                  "De la patience et de la pédagogie",
                  "Une bonne communication avec les élèves et parents",
                  "Des disponibilités flexibles",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="mb-4 text-2xl font-bold">Prêt à commencer ?</h3>
                <p className="mb-6 text-muted-foreground">
                  L'inscription est gratuite et ne prend que quelques minutes.
                </p>
                <Link href="/inscription?role=teacher">
                  <Button size="lg" className="w-full gap-2" data-testid="button-register-teacher-cta">
                    Créer mon profil professeur
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
