import { Link } from "wouter";
import { ArrowRight, BookOpen, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16 md:py-24">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Award className="h-4 w-4" />
              <span>La référence du soutien scolaire en Guinée</span>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Réussissez avec{" "}
              <span className="text-primary">ProfGui</span>
            </h1>
            
            <p className="text-lg text-muted-foreground md:text-xl">
              Trouvez le professeur particulier idéal pour vos enfants ou proposez vos 
              services d'enseignement. Cours à domicile ou en ligne, partout en Guinée.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/trouver-professeur">
                <Button size="lg" className="w-full gap-2 sm:w-auto" data-testid="button-find-teacher-hero">
                  Trouver un professeur
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/devenir-professeur">
                <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-become-teacher-hero">
                  Devenir professeur
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">500+</div>
                  <div className="text-sm text-muted-foreground">Élèves inscrits</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">50+</div>
                  <div className="text-sm text-muted-foreground">Professeurs qualifiés</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -right-4 -top-4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-4 -left-4 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative rounded-2xl border bg-card p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    M
                  </div>
                  <div>
                    <div className="font-semibold">Mamadou Diallo</div>
                    <div className="text-sm text-muted-foreground">Professeur de Mathématiques</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="rounded bg-primary/10 px-2 py-1 text-primary">Mathématiques</span>
                    <span className="rounded bg-primary/10 px-2 py-1 text-primary">Physique</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    10 ans d'expérience • Conakry
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm italic text-muted-foreground">
                    "Je suis passionné par l'enseignement et j'aide mes élèves à atteindre 
                    l'excellence académique depuis plus de 10 ans."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
