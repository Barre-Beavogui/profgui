import { Link } from "wouter";
import { ArrowRight, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "+224629516388";
const PHONE_NUMBER = "+224629516388";

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-lg bg-primary px-6 py-12 text-center text-primary-foreground shadow-xl md:px-12 md:py-16">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=82"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/92 via-emerald-900/84 to-emerald-800/72" />
          
          <div className="relative space-y-6">
            <h2 className="text-3xl font-bold md:text-4xl">
              Besoin d'organiser un accompagnement scolaire ?
            </h2>
            <p className="mx-auto max-w-2xl text-lg opacity-90">
              Créez un compte ou contactez ProfGui pour être orienté vers le bon
              parcours: famille, élève ou professeur.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/inscription">
                <Button size="lg" variant="secondary" className="w-full gap-2 rounded-md bg-amber-400 font-black text-emerald-950 hover:bg-amber-300 sm:w-auto" data-testid="button-register-cta">
                  Créer mon espace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="gap-2 rounded-md border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                    <SiWhatsapp className="h-5 w-5" />
                    WhatsApp
                  </Button>
                </a>
                <a href={`tel:${PHONE_NUMBER}`}>
                  <Button size="lg" variant="outline" className="gap-2 rounded-md border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                    <Phone className="h-5 w-5" />
                    Appeler
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
