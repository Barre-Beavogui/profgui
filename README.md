# profgui

Application web full-stack en **TypeScript**.

- **Frontend** : React + Vite, Tailwind CSS
- **Backend** : Express
- **ORM** : Drizzle ORM (PostgreSQL)
- **Validation** : Zod
- **Auth** : Passport (local)

## Scripts (root)
- `npm install` : installe les dépendances
- `npm run dev` : démarre le serveur en dev
- `npm run build` : build (via script/build.ts)
- `npm run start` : lance la production à partir de `dist`
- `npm run build:pages` : build pour GitHub Pages
- `npm run db:push` : pousse les migrations Drizzle

## Structure
- `client/` : UI
- `server/` : API/Backend
- `shared/` : types et schémas partagés
- `script/` : scripts de build

## Déploiement
Le dépôt est préparé pour GitHub Pages (frontend) et pour un backend déployable (Render/Firebase, selon tes besoins).

## Prérequis
- Node.js (version stable)
- PostgreSQL (si tu veux l'API complète)

## Lancer localement
```bash
npm install
npm run dev
```

---

Adapte les scripts et la config selon ton environnement.
