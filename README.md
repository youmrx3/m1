# Plateforme de Gestion de Projet CSV (Universite)

Application web mobile-first pour encadrer un projet pratique Python/pandas autour de jeux de donnees CSV.

## Fonctionnalites

### Espace etudiant
- Page d accueil academique en francais
- Compte a rebours live jusqu a la date limite
- Telechargement du sujet PDF
- Inscription de groupe (max 3 etudiants)
- Choix d un dataset CSV (un seul dataset par groupe)
- Validation des champs + message de confirmation

### Espace admin (enseignant)
- Connexion securisee via Supabase Auth
- Dashboard protege
- Gestion du projet: titre, description, objectifs, deadline, PDF
- Gestion des datasets: ajout, edition, suppression, upload CSV
- Vue de tous les groupes inscrits
- Statistiques simples (nb de groupes + popularite des datasets)

## Stack technique

- React 19 + TypeScript + Vite
- Supabase:
  - Auth (connexion admin)
  - Postgres (tables groupes / datasets / settings)
  - Storage (PDF + CSV)

## Installation locale

1. Installer les dependances:

```bash
npm install
```

2. Copier `.env.example` vers `.env` et remplir:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Executer le schema SQL dans Supabase SQL Editor:

- Fichier: `supabase/schema.sql`

4. Creer un utilisateur admin dans Supabase Auth:

- Auth > Users > Add user (email + mot de passe)

5. Lancer l application:

```bash
npm run dev
```

## Structure base de donnees

- `groups`: groupes etudiants et dataset choisi
- `datasets`: catalogue des CSV disponibles
- `project_settings`: configuration globale du projet (singleton `id = 1`)

## Notes de securite

- Les policies RLS fournies autorisent:
  - lecture publique des datasets et settings
  - insertion publique des groupes (inscription etudiants)
  - ecriture admin via role `authenticated`
- Pour un environnement de production strict, vous pouvez ajouter des claims custom pour distinguer un vrai role `admin`.
