import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { PREFECTURES, GuineaSubPrefecture } from "@/lib/geography";
import { SUB_PREFECTURES } from "@/lib/subPrefectures";

const categories = [
  {
    id: "formation" as const,
    title: "Formations",
    description:
      "Cours en ligne et en présentiel proposés par des professionnels et organisations.",
  },
  {
    id: "document" as const,
    title: "Documents & Livres",
    description:
      "Brochures, livres numériques, corrigés, fiches de révision, et contenus PDF.",
  },
  {
    id: "materiel" as const,
    title: "Matériel éducatif",
    description:
      "Fournitures, outils pédagogiques, kits, équipements scolaires et supports.",
  },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]["id"]>();
  const [prefecture, setPrefecture] = useState<string>("Conakry");
  const [subPrefecture, setSubPrefecture] = useState<string>("");

  // Sous-préfectures en statique dans le repo (plus stable que fetch externe)
  const subPrefectures: GuineaSubPrefecture[] = SUB_PREFECTURES;

  useEffect(() => {
    // Reset sub-prefecture when prefecture changes
    setSubPrefecture("");
  }, [prefecture]);

  const availableSubPrefs = useMemo(() => {
    return subPrefectures
      .filter((sp) => sp.prefecture.toLowerCase().includes(prefecture.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subPrefectures, prefecture]);

  const subPrefCount = availableSubPrefs.length;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace Éducation</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Vente de tout ce qui concerne l’éducation: formations, documents, livres et matériel.
              Sélectionnez votre zone (Conakry, 33 préfectures) et, si disponible, la sous-préfecture.
            </p>
          </div>
          <div className="hidden sm:block text-right text-sm text-muted-foreground">
            <div>Préfectures: {PREFECTURES.length}</div>
            <div>Sous-préfectures: {subPrefectures.length}</div>
          </div>
        </div>

        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory((prev) => (prev === c.id ? undefined : c.id))}
                className={`rounded-lg border p-4 text-left transition hover:bg-muted ${
                  selectedCategory === c.id ? "border-primary" : "border-border"
                }`}
              >
                <div className="font-semibold">{c.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.description}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="prefecture">
                Préfecture
              </label>
              <select
                id="prefecture"
                className="mt-2 w-full rounded border bg-background p-2"
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
              >
                {PREFECTURES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="sub-pref">
                Sous-préfecture {subPrefCount ? `(${subPrefCount})` : ""}
              </label>
              <select
                id="sub-pref"
                className="mt-2 w-full rounded border bg-background p-2"
                value={subPrefecture}
                onChange={(e) => setSubPrefecture(e.target.value)}
                disabled={!subPrefCount}
              >
                <option value="">Toutes</option>
                {availableSubPrefs.map((sp) => (
                  <option key={`${sp.prefecture}-${sp.name}`} value={sp.name}>
                    {sp.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                Liste des sous-préfectures servie en statique depuis le dépôt (seed ProfGui).
                À compléter dans <code>client/src/lib/subPrefectures.ts</code>.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-lg border p-6 bg-background">
            <h2 className="text-xl font-semibold">Publier / vendre</h2>
            <p className="mt-2 text-muted-foreground">
              Pour publier une formation, un document ou du matériel éducatif, contacte l’équipe ProfGui
              (validation, contrôle qualité, livraison par zone).
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                href="https://wa.me/224620000000"
              >
                WhatsApp ProfGui
              </a>

              <a
                className="rounded border px-4 py-2 text-sm font-semibold"
                href="tel:+224620000000"
              >
                Appeler
              </a>

              <a
                className="rounded border px-4 py-2 text-sm font-semibold"
                href="mailto:contact@profgui.com"
              >
                Email
              </a>
            </div>

            <div className="mt-6 text-sm">
              <div className="font-medium">Accès rapides</div>
              <ul className="mt-1 list-disc pl-5 space-y-1 text-muted-foreground">
                <li>
                  <Link to="/">Retour à l’accueil</Link>
                </li>
                <li>
                  <Link to="/devenir-professeur">Devenir professeur</Link> (si tu proposes des cours)
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
