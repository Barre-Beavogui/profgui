import { Link } from "wouter";
import { GraduationCap, Phone, Mail, MapPin } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_NUMBER = "+224620000000";
const PHONE_NUMBER = "+224620000000";
const EMAIL = "contact@profgui.com";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ProfGui</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              La plateforme de soutien scolaire de référence en Guinée Conakry. 
              Trouvez le professeur idéal pour réussir.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Navigation</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Accueil
              </Link>
              <Link href="/trouver-professeur" className="text-muted-foreground hover:text-foreground transition-colors">
                Trouver un professeur
              </Link>
              <Link href="/devenir-professeur" className="text-muted-foreground hover:text-foreground transition-colors">
                Devenir professeur
              </Link>
              <Link href="/inscription" className="text-muted-foreground hover:text-foreground transition-colors">
                S'inscrire
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Pour les parents</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/inscription?role=parent" className="text-muted-foreground hover:text-foreground transition-colors">
                Créer un compte parent
              </Link>
              <Link href="/trouver-professeur" className="text-muted-foreground hover:text-foreground transition-colors">
                Rechercher un professeur
              </Link>
              <span className="text-muted-foreground">
                Suivre les cours de vos enfants
              </span>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-green-600 transition-colors"
                data-testid="link-whatsapp-footer"
              >
                <SiWhatsapp className="h-4 w-4" />
                <span>WhatsApp: {WHATSAPP_NUMBER}</span>
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-phone-footer"
              >
                <Phone className="h-4 w-4" />
                <span>{PHONE_NUMBER}</span>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>{EMAIL}</span>
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Conakry, Guinée</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ProfGui. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
