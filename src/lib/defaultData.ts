import type { Dataset, ProjectSettings } from '../types'

const now = new Date()
const deadline = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 20)

export const defaultProjectSettings: ProjectSettings = {
  id: 1,
  title: 'Projet Python & Analyse CSV',
  description:
    'Travail de groupe en informatique: nettoyage, analyse et visualisation de donnees CSV avec Python et pandas.',
  tasks_python:
    '- Lire le fichier CSV avec pandas\n- Nettoyer les donnees\n- Realiser une analyse descriptive\n- Produire des visualisations pertinentes',
  deliverables:
    '- Un script Python commente\n- Un rapport PDF court\n- Les graphiques produits\n- Un dossier de rendu organise',
  pedagogical_objectives:
    '- Savoir manipuler des donnees CSV avec pandas\n- Comprendre les etapes de nettoyage\n- Interpretrer des resultats simples\n- Structurer un petit projet Python',
  submission_rules:
    '- Remettre un seul dossier par groupe\n- Nommer les fichiers de facon claire\n- Respecter la date limite\n- Citer les sources utilisees',
  deadline: deadline.toISOString(),
  project_pdf_path: null,
  project_pdf_url: null,
  updated_at: now.toISOString(),
}

export const defaultDatasets: Dataset[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Performance Etudiants',
    description: 'Notes, absences et progression semestrielle de 1200 etudiants.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Trafic Reseau Campus',
    description: 'Logs horaires du trafic internet du campus sur 12 mois.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Bibliotheque Universitaire',
    description: 'Historique des emprunts de livres par categorie.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Consommation Energie',
    description: 'Releves de consommation electrique de differents batiments.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Resultats Sondage Pedagogique',
    description: 'Avis anonymes des etudiants sur les cours et travaux pratiques.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Mobilite Etudiante',
    description: 'Donnees d echanges universitaires et destinations ERASMUS.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Capteurs Meteo Local',
    description: 'Temperature, humidite et vent collectes toutes les 30 minutes.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'Occupation Salles',
    description: 'Planning d occupation des salles de TP et taux d utilisation.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'Donnees Cafeteria',
    description: 'Ventes journalieres par produit, tranche horaire et saison.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Suivi Plateforme e-Learning',
    description: 'Connexions, activites et progression sur la plateforme LMS.',
    file_path: null,
    file_url: null,
    created_at: now.toISOString(),
  },
]
