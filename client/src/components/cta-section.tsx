import { Link } from "wouter";
import { ArrowRight, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "+224620000000";
const PHONE_NUMBER = "+224620000000";

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground md:px-12 md:py-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          
          <div className="relative space-y-6">
            <h2 className="text-3xl font-bold md:text-4xl">
              Prêt à commencer ?
            </h2>
            <p className="mx-auto max-w-2xl text-lg opacity-90">
              Rejoignez des centaines de familles guinéennes qui font confiance à ProfGui 
              pour l'éducation de leurs enfants.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/inscription">
                <Button size="lg" variant="secondary" className="w-full gap-2 sm:w-auto" data-testid="button-register-cta">
                  S'inscrire gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                    <SiWhatsapp className="h-5 w-5" />
                    WhatsApp
                  </Button>
                </a>
                <a href={`tel:${PHONE_NUMBER}`}>
                  <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
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
