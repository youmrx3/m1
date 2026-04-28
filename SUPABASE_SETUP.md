# 🚀 Configuration Supabase - Guide d'Installation

Votre projet Supabase est créé ! Suivez ces étapes pour l'activer.

## Projet Supabase
**URL:** https://vpwsgzpiwyhdfphrrexz.supabase.co  
**Dashboard:** https://app.supabase.com

---

## Étape 1: Initialiser le schéma de base de données

1. Allez dans **SQL Editor**  
   https://app.supabase.com/project/vpwsgzpiwyhdfphrrexz/sql/new

2. Copiez **tout le contenu** du fichier `supabase/schema.sql` (dans ce projet)

3. Collez-le dans l'éditeur SQL

4. Cliquez sur **"Run"** pour exécuter toutes les migrations

5. Vérifiez qu'il n'y a pas d'erreurs (les messages "already exists" sont normaux)

---

## Étape 2: Créer le bucket de stockage

1. Allez dans **Storage** > **Buckets**  
   https://app.supabase.com/project/vpwsgzpiwyhdfphrrexz/storage/buckets

2. Cliquez **"Create bucket"**

3. Nommez-le: `project_files`

4. Activez **"Public bucket"** (cochez la case)

5. Cliquez **"Create bucket"**

---

## Étape 3: Créer un utilisateur administrateur

1. Allez dans **Authentication** > **Users**  
   https://app.supabase.com/project/vpwsgzpiwyhdfphrrexz/auth/users

2. Cliquez sur **"Add user"**

3. Entrez:
   - **Email:** Ex: `prof@universite.fr`
   - **Password:** Votre mot de passe fort

4. Cliquez **"Create user"**

---

## Étape 4: Tester l'application

1. Assurez-vous que le serveur tourne:
   ```bash
   npm run dev
   ```

2. Testez les liens:
   - **Page étudiant:** http://localhost:5173/
   - **Page admin:** http://localhost:5173/admin/login

3. Connectez-vous avec l'email/mot de passe créés à l'étape 3

---

## ✅ Vous êtes prêt!

L'app est maintenant fonctionnelle avec:
- Inscription des groupes ✓
- Sélection des datasets ✓
- Dashboard admin complet ✓
- Upload de PDF et CSV ✓

**Besoin d'aide?** Vérifiez que:
- Le fichier `.env` contient vos clés Supabase
- Le SQL a bien exécuté sans erreurs critiques
- Le bucket `project_files` est public
