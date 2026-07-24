import { Link } from "wouter";
import { ArrowRight, GraduationCap, FileText, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: GraduationCap,
    title: "Formations",
    description: "Cours particuliers, ateliers et formations continues.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: FileText,
    title: "Documents",
    description: "Guides de révision, annales et livres numériques.",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: ShoppingBag,
    title: "Matériel",
    description: "Kits pédagogiques et fournitures scolaires de qualité.",
    color: "bg-purple-500/10 text-purple-600",
  },
];

export function MarketplaceTeaser() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Store className="h-4 w-4" />
              <span>Ressources ProfGui</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Supports et outils pour compléter les cours
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              En complément des cours particuliers, ProfGui peut regrouper des
              documents, formations et ressources utiles pour les élèves.
            </p>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="rounded-lg border bg-background shadow-sm transition-transform hover:-translate-y-1">
                    <CardContent className="p-4">
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mb-1 font-bold">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-10">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2">
                  Découvrir les ressources
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-tr from-primary to-amber-500 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Store className="h-64 w-64 text-white" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="mt-8 space-y-4">
                    <Card className="animate-pulse shadow-xl">
                      <CardContent className="p-4">
                        <div className="h-4 w-24 rounded bg-muted mb-2" />
                        <div className="h-3 w-32 rounded bg-muted/60" />
                      </CardContent>
                    </Card>
                    <Card className="shadow-xl">
                      <CardContent className="p-4">
                        <div className="h-4 w-20 rounded bg-muted mb-2" />
                        <div className="h-3 w-28 rounded bg-muted/60" />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    <Card className="shadow-xl">
                      <CardContent className="p-4">
                        <div className="h-4 w-28 rounded bg-muted mb-2" />
                        <div className="h-3 w-36 rounded bg-muted/60" />
                      </CardContent>
                    </Card>
                    <Card className="animate-pulse shadow-xl">
                      <CardContent className="p-4">
                        <div className="h-4 w-16 rounded bg-muted mb-2" />
                        <div className="h-3 w-24 rounded bg-muted/60" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
