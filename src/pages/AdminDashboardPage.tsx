import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deleteDataset,
  deleteGroup,
  fetchAdminOverview,
  signOutAdmin,
  updateGroup,
  upsertDataset,
  upsertProjectSettings,
} from '../lib/api'
import { defaultProjectSettings } from '../lib/defaultData'
import { isSupabaseConfigured } from '../lib/supabase'
import type { AdminOverview, Dataset, Group } from '../types'

const toDateTimeLocal = (isoValue: string) => {
  const date = new Date(isoValue)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

const toIsoDate = (localValue: string) => {
  const date = new Date(localValue)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`

const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}

type ProjectFormState = {
  title: string
  description: string
  tasks_python: string
  deliverables: string
  pedagogical_objectives: string
  submission_rules: string
  deadline: string
}

type DatasetFormState = {
  id: string | null
  name: string
  description: string
  currentFilePath: string | null
  csvFile: File | null
}

type GroupFormState = {
  id: string | null
  groupName: string
  student1Name: string
  student2Name: string
  student3Name: string
  datasetId: string
}

const emptyProjectForm: ProjectFormState = {
  title: defaultProjectSettings.title,
  description: defaultProjectSettings.description,
  tasks_python: defaultProjectSettings.tasks_python,
  deliverables: defaultProjectSettings.deliverables,
  pedagogical_objectives: defaultProjectSettings.pedagogical_objectives,
  submission_rules: defaultProjectSettings.submission_rules,
  deadline: '',
}

const emptyDatasetForm: DatasetFormState = {
  id: null,
  name: '',
  description: '',
  currentFilePath: null,
  csvFile: null,
}

const emptyGroupForm: GroupFormState = {
  id: null,
  groupName: '',
  student1Name: '',
  student2Name: '',
  student3Name: '',
  datasetId: '',
}

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProject, setSavingProject] = useState(false)
  const [savingDataset, setSavingDataset] = useState(false)
  const [savingGroup, setSavingGroup] = useState(false)
  const [projectForm, setProjectForm] = useState<ProjectFormState>(emptyProjectForm)
  const [datasetForm, setDatasetForm] = useState<DatasetFormState>(emptyDatasetForm)
  const [groupForm, setGroupForm] = useState<GroupFormState>(emptyGroupForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadOverview = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const dashboard = await fetchAdminOverview()

      setOverview(dashboard)
      setProjectForm({
        title: dashboard.settings.title,
        description: dashboard.settings.description,
        tasks_python: dashboard.settings.tasks_python,
        deliverables: dashboard.settings.deliverables,
        pedagogical_objectives: dashboard.settings.pedagogical_objectives,
        submission_rules: dashboard.settings.submission_rules,
        deadline: toDateTimeLocal(dashboard.settings.deadline),
      })
    } catch (loadError) {
      const details = loadError instanceof Error ? loadError.message : ''
      setError(`Chargement admin impossible. ${details}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOverview()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const popularity = useMemo(() => {
    if (!overview) {
      return []
    }

    const counts = new Map<string, number>()

    overview.groups.forEach((group) => {
      const key = group.dataset_name ?? 'Sans dataset'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })

    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [overview])

  const exportGroupsCsv = () => {
    if (!overview || overview.groups.length === 0) {
      setError('Aucun groupe a exporter pour le moment.')
      return
    }

    const header = [
      'Nom du groupe',
      'Etudiant 1',
      'Etudiant 2',
      'Etudiant 3',
      'Dataset',
      'Date d inscription',
    ]

    const rows = overview.groups.map((group) => [
      group.group_name || 'Sans nom',
      group.student1_name,
      group.student2_name || '',
      group.student3_name || '',
      group.dataset_name || 'Non renseigne',
      new Date(group.created_at).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    ])

    const csv = [header, ...rows]
      .map((line) => line.map((value) => escapeCsvValue(value)).join(','))
      .join('\n')

    downloadCsv(`groupes-${new Date().toISOString().slice(0, 10)}.csv`, csv)
    setMessage('Export CSV des groupes genere.')
  }

  const handleProjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    setSavingProject(true)

    try {
      await upsertProjectSettings({
        title: projectForm.title,
        description: projectForm.description,
        tasks_python: projectForm.tasks_python,
        deliverables: projectForm.deliverables,
        pedagogical_objectives: projectForm.pedagogical_objectives,
        submission_rules: projectForm.submission_rules,
        deadline: toIsoDate(projectForm.deadline),
      })

      setMessage('Configuration du projet enregistree.')
      await loadOverview()
    } catch (saveError) {
      const details = saveError instanceof Error ? saveError.message : ''
      setError(`Echec de mise a jour du projet. ${details}`)
    } finally {
      setSavingProject(false)
    }
  }

  const handleDatasetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    setSavingDataset(true)

    try {
      await upsertDataset({
        id: datasetForm.id,
        name: datasetForm.name,
        description: datasetForm.description,
        csvFile: datasetForm.csvFile,
        currentFilePath: datasetForm.currentFilePath,
      })

      setMessage(
        datasetForm.id
          ? 'Dataset mis a jour avec succes.'
          : 'Dataset ajoute avec succes.',
      )
      setDatasetForm(emptyDatasetForm)
      await loadOverview()
    } catch (saveError) {
      const details = saveError instanceof Error ? saveError.message : ''
      setError(`Impossible d enregistrer le dataset. ${details}`)
    } finally {
      setSavingDataset(false)
    }
  }

  const startEditDataset = (dataset: Dataset) => {
    setDatasetForm({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      currentFilePath: dataset.file_path,
      csvFile: null,
    })
  }

  const handleDeleteDataset = async (dataset: Dataset) => {
    const shouldDelete = window.confirm(
      `Supprimer le dataset ${dataset.name} ? Cette action est irreversible.`,
    )

    if (!shouldDelete) {
      return
    }

    setError('')
    setMessage('')

    try {
      await deleteDataset(dataset.id, dataset.file_path)
      setMessage('Dataset supprime.')
      await loadOverview()
    } catch (deleteError) {
      const details = deleteError instanceof Error ? deleteError.message : ''
      setError(`Suppression impossible. ${details}`)
    }
  }

  const startEditGroup = (group: Group) => {
    setGroupForm({
      id: group.id,
      groupName: group.group_name || '',
      student1Name: group.student1_name,
      student2Name: group.student2_name || '',
      student3Name: group.student3_name || '',
      datasetId: group.dataset_id || '',
    })
  }

  const handleGroupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!groupForm.id) {
      setError('ID du groupe manquant.')
      return
    }

    setSavingGroup(true)

    try {
      await updateGroup({
        id: groupForm.id,
        groupName: groupForm.groupName,
        student1Name: groupForm.student1Name,
        student2Name: groupForm.student2Name,
        student3Name: groupForm.student3Name,
        datasetId: groupForm.datasetId,
      })

      setMessage('Groupe mis a jour avec succes.')
      setGroupForm(emptyGroupForm)
      await loadOverview()
    } catch (saveError) {
      const details = saveError instanceof Error ? saveError.message : ''
      setError(`Impossible de mettre a jour le groupe. ${details}`)
    } finally {
      setSavingGroup(false)
    }
  }

  const handleDeleteGroup = async (group: Group) => {
    const shouldDelete = window.confirm(
      `Supprimer le groupe "${group.group_name || 'Groupe sans nom'}" ? Cette action est irreversible.`,
    )

    if (!shouldDelete) {
      return
    }

    setError('')
    setMessage('')

    try {
      await deleteGroup(group.id)
      setMessage('Groupe supprime.')
      setGroupForm(emptyGroupForm)
      await loadOverview()
    } catch (deleteError) {
      const details = deleteError instanceof Error ? deleteError.message : ''
      setError(`Suppression impossible. ${details}`)
    }
  }

  const handleLogout = async () => {
    try {
      await signOutAdmin()
      navigate('/admin/login', { replace: true })
    } catch (signOutError) {
      const details = signOutError instanceof Error ? signOutError.message : ''
      setError(`Deconnexion impossible. ${details}`)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-shell">
        <section className="card reveal">
          <h1>Dashboard admin indisponible</h1>
          <p className="section-text">
            Ajoutez d abord les variables Supabase dans le fichier .env pour activer la gestion.
          </p>
        </section>
      </main>
    )
  }

  if (loading || !overview) {
    return (
      <main className="admin-shell">
        <p className="status-line">Chargement du dashboard...</p>
      </main>
    )
  }

  return (
    <main className="admin-shell">
      <header className="dashboard-header reveal">
        <div>
          <p className="eyebrow">Administration projet</p>
          <h1>Tableau de bord enseignant</h1>
        </div>
        <button type="button" className="btn-secondary" onClick={handleLogout}>
          Se deconnecter
        </button>
      </header>

      <section className="stat-grid reveal">
        <article className="stat-card">
          <p>Groupes inscrits</p>
          <strong>{overview.groups.length}</strong>
        </article>

        <article className="stat-card">
          <p>Datasets disponibles</p>
          <strong>{overview.datasets.length}</strong>
        </article>

        <article className="stat-card">
          <p>Dataset le plus choisi</p>
          <strong>{popularity[0] ? `${popularity[0][0]} (${popularity[0][1]})` : 'Aucun choix'}</strong>
        </article>
      </section>

      {error ? <p className="status-line error">{error}</p> : null}
      {message ? <p className="status-line success">{message}</p> : null}

      <section className="card reveal">
        <h2>Consignes du projet</h2>
        <p className="section-text">
          Modifiez ici tout le contenu visible dans la section consignes du projet sur la page etudiante.
        </p>
        <form className="form-grid" onSubmit={handleProjectSubmit}>
          <label>
            Titre du projet
            <input
              type="text"
              value={projectForm.title}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            Description courte
            <textarea
              value={projectForm.description}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              required
            />
          </label>

          <label>
            Taches Python a realiser
            <textarea
              value={projectForm.tasks_python}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  tasks_python: event.target.value,
                }))
              }
              rows={4}
              required
            />
          </label>

          <label>
            Livrables attendus
            <textarea
              value={projectForm.deliverables}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  deliverables: event.target.value,
                }))
              }
              rows={4}
              required
            />
          </label>

          <label>
            Objectifs pedagogiques
            <textarea
              value={projectForm.pedagogical_objectives}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  pedagogical_objectives: event.target.value,
                }))
              }
              rows={4}
              required
            />
          </label>

          <label>
            Regles de soumission
            <textarea
              value={projectForm.submission_rules}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  submission_rules: event.target.value,
                }))
              }
              rows={4}
              required
            />
          </label>

          <label>
            Date limite
            <input
              type="datetime-local"
              value={projectForm.deadline}
              onChange={(event) =>
                setProjectForm((current) => ({
                  ...current,
                  deadline: event.target.value,
                }))
              }
              required
            />
          </label>

          <button className="btn-primary" type="submit" disabled={savingProject}>
            {savingProject ? 'Enregistrement...' : 'Mettre a jour le projet'}
          </button>
        </form>
      </section>

      <section className="card reveal">
        <h2>Gestion des datasets</h2>
        <p className="section-text">
          Les datasets ci-dessous sont ceux proposes aux etudiants sur la page principale.
        </p>

        <div className="dataset-summary-strip">
          {overview.datasets.map((dataset) => (
            <span key={dataset.id} className="dataset-summary-chip">
              {dataset.name}
            </span>
          ))}
        </div>

        <form className="form-grid" onSubmit={handleDatasetSubmit}>
          <label>
            Nom du dataset
            <input
              type="text"
              value={datasetForm.name}
              onChange={(event) =>
                setDatasetForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={datasetForm.description}
              onChange={(event) =>
                setDatasetForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              required
            />
          </label>

          <label>
            Fichier CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) =>
                setDatasetForm((current) => ({
                  ...current,
                  csvFile: event.target.files?.[0] ?? null,
                }))
              }
            />
          </label>

          <div className="inline-actions">
            <button className="btn-primary" type="submit" disabled={savingDataset}>
              {savingDataset
                ? 'Traitement...'
                : datasetForm.id
                  ? 'Mettre a jour le dataset'
                  : 'Ajouter le dataset'}
            </button>

            {datasetForm.id ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDatasetForm(emptyDatasetForm)}
              >
                Annuler edition
              </button>
            ) : null}
          </div>
        </form>

        <div className="dataset-grid admin-grid">
          {overview.datasets.map((dataset) => (
            <article className="dataset-card" key={dataset.id}>
              <h3>{dataset.name}</h3>
              <p>{dataset.description}</p>

              <div className="inline-actions compact">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => startEditDataset(dataset)}
                >
                  Editer
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleDeleteDataset(dataset)}
                >
                  Supprimer
                </button>
              </div>

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
      </section>

      <section className="card reveal">
        <h2>Gestion des groupes</h2>
        <p className="section-text">
          Modifiez ou supprimez les groupes enregistres, consultez les inscriptions et exportez la liste en CSV.
        </p>

        {groupForm.id ? (
          <form className="form-grid" onSubmit={handleGroupSubmit}>
            <label>
              Nom du groupe (optionnel)
              <input
                type="text"
                value={groupForm.groupName}
                onChange={(event) =>
                  setGroupForm((current) => ({
                    ...current,
                    groupName: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Etudiant 1 (requis)
              <input
                type="text"
                value={groupForm.student1Name}
                onChange={(event) =>
                  setGroupForm((current) => ({
                    ...current,
                    student1Name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label>
              Etudiant 2 (optionnel)
              <input
                type="text"
                value={groupForm.student2Name}
                onChange={(event) =>
                  setGroupForm((current) => ({
                    ...current,
                    student2Name: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Etudiant 3 (optionnel)
              <input
                type="text"
                value={groupForm.student3Name}
                onChange={(event) =>
                  setGroupForm((current) => ({
                    ...current,
                    student3Name: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Dataset
              <select
                value={groupForm.datasetId}
                onChange={(event) =>
                  setGroupForm((current) => ({
                    ...current,
                    datasetId: event.target.value,
                  }))
                }
                required
              >
                <option value="">-- Selectionnez un dataset --</option>
                {overview?.datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="inline-actions">
              <button className="btn-primary" type="submit" disabled={savingGroup}>
                {savingGroup ? 'Mise a jour...' : 'Mettre a jour le groupe'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setGroupForm(emptyGroupForm)}
              >
                Annuler edition
              </button>
            </div>
          </form>
        ) : null}

        <div className="section-header-row">
          <div>
            <h3>Groupes enregistres</h3>
          </div>
          <button type="button" className="btn-secondary" onClick={exportGroupsCsv}>
            Exporter CSV
          </button>
        </div>

        <div className="group-list">
          {overview.groups.length === 0 ? (
            <p className="section-text">Aucun groupe inscrit pour le moment.</p>
          ) : (
            overview.groups.map((group) => (
              <article className="group-row" key={group.id}>
                <div>
                  <p>
                    <strong>{group.group_name || 'Groupe sans nom'}</strong>
                  </p>
                  <p>
                    Membres: {[group.student1_name, group.student2_name, group.student3_name]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <p>Dataset: {group.dataset_name ?? 'Non renseigne'}</p>
                  <p>
                    Date inscription:{' '}
                    {new Date(group.created_at).toLocaleString('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="inline-actions compact">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => startEditGroup(group)}
                  >
                    Editer
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDeleteGroup(group)}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="analytics-list">
          <h3>Popularite des datasets</h3>
          {popularity.length === 0 ? (
            <p className="section-text">Aucune donnee de popularite pour le moment.</p>
          ) : (
            <ul>
              {popularity.map(([datasetName, count]) => (
                <li key={datasetName}>
                  {datasetName}: {count} groupe(s)
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

export default AdminDashboardPage
