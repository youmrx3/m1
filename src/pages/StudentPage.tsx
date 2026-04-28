import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Countdown from '../components/Countdown'
import {
  fetchDatasets,
  fetchProjectSettings,
  registerGroup,
} from '../lib/api'
import { isSupabaseConfigured } from '../lib/supabase'
import type { Dataset, ProjectSettings } from '../types'

type RegistrationState = {
  groupName: string
  student1Name: string
  student2Name: string
  student3Name: string
}

const initialForm: RegistrationState = {
  groupName: '',
  student1Name: '',
  student2Name: '',
  student3Name: '',
}

function StudentPage() {
  const [settings, setSettings] = useState<ProjectSettings | null>(null)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState<RegistrationState>(initialForm)

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true)
      setError('')

      try {
        const [projectSettings, availableDatasets] = await Promise.all([
          fetchProjectSettings(),
          fetchDatasets(),
        ])

        setSettings(projectSettings)
        setDatasets(availableDatasets)

        if (availableDatasets.length > 0) {
          setSelectedDataset((currentValue) =>
            currentValue || availableDatasets[0].id,
          )
        }
      } catch (loadError) {
        const details = loadError instanceof Error ? loadError.message : ''
        setError(`Impossible de charger les informations du projet. ${details}`)
      } finally {
        setLoading(false)
      }
    }

    void loadPageData()
  }, [])

  const tasksPython = (settings?.tasks_python ?? '')
    .split('\n')
    .map((item) => item.replace(/^[-*]\s?/, '').trim())
    .filter(Boolean)

  const deliverables = (settings?.deliverables ?? '')
    .split('\n')
    .map((item) => item.replace(/^[-*]\s?/, '').trim())
    .filter(Boolean)

  const pedagogicalObjectives = (settings?.pedagogical_objectives ?? '')
    .split('\n')
    .map((item) => item.replace(/^[-*]\s?/, '').trim())
    .filter(Boolean)

  const submissionRules = (settings?.submission_rules ?? '')
    .split('\n')
    .map((item) => item.replace(/^[-*]\s?/, '').trim())
    .filter(Boolean)

  const selectedDatasetInfo = datasets.find((item) => item.id === selectedDataset)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!selectedDataset) {
      setError('Selectionnez un dataset avant de valider le formulaire.')
      return
    }

    const members = [
      form.student1Name.trim(),
      form.student2Name.trim(),
      form.student3Name.trim(),
    ].filter(Boolean)

    if (!form.student1Name.trim()) {
      setError('Le nom de l etudiant 1 est obligatoire.')
      return
    }

    if (members.length > 3) {
      setError('Un groupe ne peut pas depasser 3 etudiants.')
      return
    }

    if (!isSupabaseConfigured) {
      setError(
        'Configuration Supabase manquante. Ajoutez vos variables d environnement pour enregistrer les groupes.',
      )
      return
    }

    setSubmitting(true)

    try {
      const confirmation = await registerGroup({
        groupName: form.groupName,
        student1Name: form.student1Name,
        student2Name: form.student2Name,
        student3Name: form.student3Name,
        datasetId: selectedDataset,
      })

      setMessage(confirmation)
      setForm(initialForm)
    } catch (submitError) {
      const details = submitError instanceof Error ? submitError.message : ''
      setError(`Echec de l inscription. ${details}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !settings) {
    return (
      <main className="page-shell">
        <p className="status-line">Chargement du projet en cours...</p>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <header className="hero-card reveal">
        <p className="eyebrow">Projet universitaire de programmation</p>
        <h1>{settings.title}</h1>
        <p className="hero-description">{settings.description}</p>

        <div className="hero-actions">
          <a className="btn-secondary" href="#inscription">
            Commencer l inscription
          </a>
        </div>

        {!isSupabaseConfigured ? (
          <p className="status-line warning">
            Mode demonstration actif: connectez Supabase pour enregistrer les groupes.
          </p>
        ) : null}
      </header>

      <Countdown deadline={settings.deadline} />

      {error ? <p className="status-line error">{error}</p> : null}
      {message ? <p className="status-line success">{message}</p> : null}

      <section id="inscription" className="card reveal">
        <h2>Inscription du groupe</h2>
        <p className="section-text">
          Chaque groupe peut contenir jusqu a 3 etudiants. Le premier nom est obligatoire.
        </p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nom du groupe (optionnel)
            <input
              type="text"
              value={form.groupName}
              onChange={(event) =>
                setForm((current) => ({ ...current, groupName: event.target.value }))
              }
              maxLength={70}
              placeholder="Ex: DataLab-03"
            />
          </label>

          <label>
            Etudiant 1 (obligatoire)
            <input
              type="text"
              required
              value={form.student1Name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  student1Name: event.target.value,
                }))
              }
              maxLength={80}
              placeholder="Nom complet"
            />
          </label>

          <label>
            Etudiant 2 (optionnel)
            <input
              type="text"
              value={form.student2Name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  student2Name: event.target.value,
                }))
              }
              maxLength={80}
              placeholder="Nom complet"
            />
          </label>

          <label>
            Etudiant 3 (optionnel)
            <input
              type="text"
              value={form.student3Name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  student3Name: event.target.value,
                }))
              }
              maxLength={80}
              placeholder="Nom complet"
            />
          </label>

          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Envoi en cours...' : 'Valider l inscription'}
          </button>
        </form>
      </section>

      <section className="card reveal">
        <h2>Choix du dataset CSV</h2>
        <p className="section-text">
          Choisissez un seul dataset par groupe. Votre selection sera enregistree avec l inscription.
        </p>

        <div className="dataset-grid">
          {datasets.map((dataset) => (
            <article
              className={`dataset-card ${selectedDataset === dataset.id ? 'active' : ''}`}
              key={dataset.id}
            >
              <div className="dataset-title-row">
                <h3>{dataset.name}</h3>
                <label className="dataset-radio">
                  <input
                    type="radio"
                    name="dataset-selection"
                    checked={selectedDataset === dataset.id}
                    onChange={() => setSelectedDataset(dataset.id)}
                  />
                  Selectionner
                </label>
              </div>
              <p>{dataset.description}</p>
              <a
                className={`download-link ${!dataset.file_url ? 'is-disabled' : ''}`}
                href={dataset.file_url ?? '#'}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!dataset.file_url}
              >
                Telecharger CSV
              </a>
            </article>
          ))}
        </div>

        {selectedDatasetInfo ? (
          <p className="selection-hint">
            Dataset selectionne: <strong>{selectedDatasetInfo.name}</strong>
          </p>
        ) : null}
      </section>

      <section className="card reveal">
        <h2>Consignes du projet</h2>
        <div className="instruction-grid">
          <article>
            <h3>Taches Python a realiser</h3>
            <ul>
              {tasksPython.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </article>

          <article>
            <h3>Livrables attendus</h3>
            <ul>
              {deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article>
            <h3>Objectifs pedagogiques</h3>
            <ul>
              {pedagogicalObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </article>

          <article>
            <h3>Regles de soumission</h3>
            <ul>
              {submissionRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  )
}

export default StudentPage
