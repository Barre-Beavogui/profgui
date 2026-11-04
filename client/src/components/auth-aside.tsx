import { Link } from "wouter";
import { BadgeCheck, GraduationCap, MessageCircle, ShieldCheck } from "lucide-react";

const POINTS = [
  { icon: BadgeCheck, title: "Professeurs vérifiés", text: "Chaque profil est validé par notre équipe avant d'être publié." },
  { icon: MessageCircle, title: "Contact direct", text: "Échangez avec le professeur par messagerie ou WhatsApp." },
  { icon: ShieldCheck, title: "Données protégées", text: "Vos informations personnelles restent confidentielles." },
];

/** Panneau de marque affiché à gauche des pages de connexion et de mot de passe. */
export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-emerald-700 to-emerald-900 p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
      <div aria-hidden className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />

      <Link href="/" className="relative flex items-center gap-2 text-lg font-bold">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <GraduationCap className="h-6 w-6" />
        </span>
        ProfGui
      </Link>

      <div className="relative space-y-10">
        <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">
          Chaque élève mérite le bon professeur.
        </h2>
        <ul className="space-y-6">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold">{title}</div>
                <div className="text-sm text-white/75">{text}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-white/60">© {new Date().getFullYear()} ProfGui · Conakry, Guinée</p>
    </aside>
  );
}
