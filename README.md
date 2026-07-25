# ProfGui

Application web full-stack TypeScript pour mettre en relation élèves, parents et enseignants en Guinée.

- Frontend: React, Vite, Tailwind CSS
- Backend: Express
- Base de données: PostgreSQL avec Drizzle ORM
- Validation: Zod
- Authentification: session Express, cookies HTTP-only, mots de passe hashés
- Emails: Nodemailer pour les liens de réinitialisation

## Prérequis

- Node.js 20+
- PostgreSQL
- Un compte SMTP pour l'envoi des emails

## Installation Locale

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

## Scripts

- `npm run dev`: démarre l'app en développement
- `npm run check`: vérifie TypeScript
- `npm test`: exécute les tests Node
- `npm run build`: compile frontend + backend
- `npm run build:pages`: compile le frontend pour GitHub Pages
- `npm run start`: lance la version production
- `npm run db:push`: applique le schéma Drizzle à PostgreSQL

## Variables D'environnement

Copie `.env.example` vers `.env` en local. En production, configure ces valeurs dans GitHub Actions, Cloud Run, Firebase ou ton hébergeur, pas dans Git.

- `DATABASE_URL`: connexion PostgreSQL
- `CORS_ORIGIN`: origines autorisées, séparées par des virgules
- `SESSION_SECRET`: secret long et aléatoire pour les sessions
- `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD`: compte admin initial
- `FRONTEND_BASE_URL`: URL publique utilisée dans les emails
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`: configuration SMTP
- `VITE_API_BASE_URL`: URL publique du backend appelée par le frontend

## Déploiement

La stratégie gratuite recommandée est:

- Frontend: Firebase Hosting sur `https://profgui-gn.web.app`
- Backend: Render Web Service free via `render.yaml`
- Base de données: Neon PostgreSQL free

Aligne toujours `VITE_API_BASE_URL`, `FRONTEND_BASE_URL` et `CORS_ORIGIN` avec les URL réellement déployées.

### Render + Neon

1. Crée une base Neon PostgreSQL et copie la chaîne `DATABASE_URL`.
2. Crée un Blueprint Render depuis ce dépôt. `render.yaml` configure l'API `profgui-api`.
3. Dans Render, ajoute les secrets `DATABASE_URL`, `ADMIN_PASSWORD`, `SMTP_USER`, `SMTP_PASSWORD` et `SMTP_FROM`.
4. Applique le schéma sur la base:

```bash
DATABASE_URL="postgresql://..." npm run db:push
```

5. Mets l'URL Render dans `.env.production` via `VITE_API_BASE_URL`, reconstruis puis redéploie Firebase Hosting.

## Sécurité

Les secrets ne doivent jamais être commités. Si un secret a déjà été poussé dans Git, supprime-le du dépôt puis régénère-le chez le fournisseur concerné: base de données, session, admin, SMTP, Firebase/Cloud.

Les mots de passe sont hashés côté serveur avec `scrypt`. Les anciens mots de passe en clair sont acceptés uniquement pour permettre une migration au prochain login, puis remplacés par un hash.

## Structure

- `client/`: interface React
- `server/`: API Express, email, stockage, auth
- `shared/`: schémas Drizzle/Zod partagés
- `script/`: scripts de build
