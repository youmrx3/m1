create extension if not exists pgcrypto;

-- Drop old tables to rebuild with correct schema
drop table if exists public.groups cascade;
drop table if exists public.project_settings cascade;
drop table if exists public.datasets cascade;

create table if not exists public.datasets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  file_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.project_settings (
  id int primary key,
  title text not null,
  description text not null,
  tasks_python text not null,
  deliverables text not null,
  pedagogical_objectives text not null,
  submission_rules text not null,
  deadline timestamptz not null,
  project_pdf_path text,
  updated_at timestamptz not null default now(),
  constraint project_settings_singleton check (id = 1)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  group_name text,
  student1_name text not null,
  student2_name text,
  student3_name text,
  dataset_id uuid references public.datasets(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists groups_unique_group_name_ci
  on public.groups (lower(group_name))
  where group_name is not null and btrim(group_name) <> '';

insert into public.project_settings (
  id,
  title,
  description,
  tasks_python,
  deliverables,
  pedagogical_objectives,
  submission_rules,
  deadline,
  project_pdf_path,
  updated_at
)
values (
  1,
  'Projet Python & Analyse CSV',
  'Travail de groupe en informatique autour de la preparation et de l analyse de donnees CSV.',
  '- Lire le fichier CSV avec pandas\n- Nettoyer les donnees\n- Realiser une analyse descriptive\n- Produire des visualisations pertinentes',
  '- Un script Python commente\n- Un rapport PDF court\n- Les graphiques produits\n- Un dossier de rendu organise',
  '- Savoir manipuler des donnees CSV avec pandas\n- Comprendre les etapes de nettoyage\n- Interpretrer des resultats simples\n- Structurer un petit projet Python',
  '- Remettre un seul dossier par groupe\n- Nommer les fichiers de facon claire\n- Respecter la date limite\n- Citer les sources utilisees',
  now() + interval '20 day',
  null,
  now()
)
on conflict (id) do nothing;

insert into public.datasets (id, name, description, file_path, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Performance Etudiants', 'Notes, absences et progression semestrielle de 1200 etudiants.', null, now()),
  ('22222222-2222-2222-2222-222222222222', 'Trafic Reseau Campus', 'Logs horaires du trafic internet du campus sur 12 mois.', null, now()),
  ('33333333-3333-3333-3333-333333333333', 'Bibliotheque Universitaire', 'Historique des emprunts de livres par categorie.', null, now()),
  ('44444444-4444-4444-4444-444444444444', 'Consommation Energie', 'Releves de consommation electrique de differents batiments.', null, now()),
  ('55555555-5555-5555-5555-555555555555', 'Resultats Sondage Pedagogique', 'Avis anonymes des etudiants sur les cours et travaux pratiques.', null, now()),
  ('66666666-6666-6666-6666-666666666666', 'Mobilite Etudiante', 'Donnees d echanges universitaires et destinations ERASMUS.', null, now()),
  ('77777777-7777-7777-7777-777777777777', 'Capteurs Meteo Local', 'Temperature, humidite et vent collectes toutes les 30 minutes.', null, now()),
  ('88888888-8888-8888-8888-888888888888', 'Occupation Salles', 'Planning d occupation des salles de TP et taux d utilisation.', null, now()),
  ('99999999-9999-9999-9999-999999999999', 'Donnees Cafeteria', 'Ventes journalieres par produit, tranche horaire et saison.', null, now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Suivi Plateforme e-Learning', 'Connexions, activites et progression sur la plateforme LMS.', null, now())
on conflict (id) do nothing;

alter table public.datasets enable row level security;
alter table public.project_settings enable row level security;
alter table public.groups enable row level security;

drop policy if exists "Public read datasets" on public.datasets;
create policy "Public read datasets"
  on public.datasets
  for select
  to public
  using (true);

drop policy if exists "Authenticated write datasets" on public.datasets;
create policy "Authenticated write datasets"
  on public.datasets
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public read project settings" on public.project_settings;
create policy "Public read project settings"
  on public.project_settings
  for select
  to public
  using (true);

drop policy if exists "Authenticated write project settings" on public.project_settings;
create policy "Authenticated write project settings"
  on public.project_settings
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Public register groups" on public.groups;
create policy "Public register groups"
  on public.groups
  for insert
  to public
  with check (true);

drop policy if exists "Authenticated read groups" on public.groups;
create policy "Authenticated read groups"
  on public.groups
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated update groups" on public.groups;
create policy "Authenticated update groups"
  on public.groups
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated delete groups" on public.groups;
create policy "Authenticated delete groups"
  on public.groups
  for delete
  to authenticated
  using (true);

insert into storage.buckets (id, name, public)
values ('project_files', 'project_files', true)
on conflict (id) do nothing;

drop policy if exists "Public read project files" on storage.objects;
create policy "Public read project files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'project_files');

drop policy if exists "Authenticated manage project files" on storage.objects;
create policy "Authenticated manage project files"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'project_files')
  with check (bucket_id = 'project_files');
