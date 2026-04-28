import type { Session } from '@supabase/supabase-js'
import { defaultDatasets, defaultProjectSettings } from './defaultData'
import {
  getPublicFileUrl,
  isSupabaseConfigured,
  PROJECT_STORAGE_BUCKET,
  supabase,
} from './supabase'
import type {
  AdminOverview,
  Dataset,
  DatasetPayload,
  Group,
  GroupRegistrationPayload,
  GroupUpdatePayload,
  ProjectSettings,
  ProjectSettingsPayload,
} from '../types'

const nowIso = () => new Date().toISOString()

const normalizeValue = (value: string) => value.trim().replace(/\s+/g, ' ')

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error(
      'Supabase n est pas configure. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.',
    )
  }

  return supabase
}

const mapDatasetRow = (row: Record<string, unknown>): Dataset => ({
  id: String(row.id ?? ''),
  name: String(row.name ?? ''),
  description: String(row.description ?? ''),
  file_path: (row.file_path as string | null) ?? null,
  file_url: getPublicFileUrl((row.file_path as string | null) ?? null),
  created_at: String(row.created_at ?? nowIso()),
})

const mapSettingsRow = (row: Record<string, unknown>): ProjectSettings => ({
  id: Number(row.id ?? 1),
  title: String(row.title ?? defaultProjectSettings.title),
  description: String(row.description ?? defaultProjectSettings.description),
  tasks_python: String(row.tasks_python ?? defaultProjectSettings.tasks_python),
  deliverables: String(row.deliverables ?? defaultProjectSettings.deliverables),
  pedagogical_objectives: String(
    row.pedagogical_objectives ?? defaultProjectSettings.pedagogical_objectives,
  ),
  submission_rules: String(row.submission_rules ?? defaultProjectSettings.submission_rules),
  deadline: String(row.deadline ?? defaultProjectSettings.deadline),
  project_pdf_path: (row.project_pdf_path as string | null) ?? null,
  project_pdf_url: getPublicFileUrl((row.project_pdf_path as string | null) ?? null),
  updated_at: String(row.updated_at ?? nowIso()),
})

const mapGroupRow = (row: Record<string, unknown>): Group => {
  const datasetValue = row.datasets as { name?: string } | null

  return {
    id: String(row.id ?? ''),
    group_name: (row.group_name as string | null) ?? null,
    student1_name: String(row.student1_name ?? ''),
    student2_name: (row.student2_name as string | null) ?? null,
    student3_name: (row.student3_name as string | null) ?? null,
    dataset_id: (row.dataset_id as string | null) ?? null,
    dataset_name: datasetValue?.name ?? null,
    created_at: String(row.created_at ?? nowIso()),
  }
}

export const fetchProjectSettings = async (): Promise<ProjectSettings> => {
  if (!isSupabaseConfigured || !supabase) {
    return defaultProjectSettings
  }

  const { data, error } = await supabase
    .from('project_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapSettingsRow(data) : defaultProjectSettings
}

export const fetchDatasets = async (): Promise<Dataset[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return defaultDatasets
  }

  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  if (!data || data.length === 0) {
    return defaultDatasets
  }

  return data.map((row) => mapDatasetRow(row))
}

export const registerGroup = async (
  payload: GroupRegistrationPayload,
): Promise<string> => {
  const client = ensureSupabase()

  const groupName = normalizeValue(payload.groupName)
  const student1Name = normalizeValue(payload.student1Name)
  const student2Name = normalizeValue(payload.student2Name)
  const student3Name = normalizeValue(payload.student3Name)

  if (!student1Name) {
    throw new Error('Le nom de l etudiant 1 est obligatoire.')
  }

  if (!payload.datasetId) {
    throw new Error('Selectionnez un dataset avant de valider.')
  }

  if (groupName) {
    const { data: duplicateGroup, error: duplicateError } = await client
      .from('groups')
      .select('id')
      .ilike('group_name', groupName)
      .limit(1)

    if (duplicateError) {
      throw duplicateError
    }

    if (duplicateGroup && duplicateGroup.length > 0) {
      throw new Error('Ce nom de groupe est deja utilise.')
    }
  }

  const { error } = await client.from('groups').insert({
    group_name: groupName || null,
    student1_name: student1Name,
    student2_name: student2Name || null,
    student3_name: student3Name || null,
    dataset_id: payload.datasetId,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ce groupe existe deja. Utilisez un autre nom.')
    }

    throw error
  }

  return 'Inscription enregistree avec succes.'
}

export const fetchAdminOverview = async (): Promise<AdminOverview> => {
  const client = ensureSupabase()

  const [groupsResult, datasetsResult, settingsResult] = await Promise.all([
    client
      .from('groups')
      .select(
        'id, group_name, student1_name, student2_name, student3_name, dataset_id, created_at, datasets(name)',
      )
      .order('created_at', { ascending: false }),
    client.from('datasets').select('*').order('created_at', { ascending: true }),
    client.from('project_settings').select('*').eq('id', 1).maybeSingle(),
  ])

  if (groupsResult.error) {
    throw groupsResult.error
  }

  if (datasetsResult.error) {
    throw datasetsResult.error
  }

  if (settingsResult.error) {
    throw settingsResult.error
  }

  return {
    groups: (groupsResult.data ?? []).map((row) => mapGroupRow(row)),
    datasets: (datasetsResult.data ?? []).map((row) => mapDatasetRow(row)),
    settings: settingsResult.data
      ? mapSettingsRow(settingsResult.data)
      : defaultProjectSettings,
  }
}

export const upsertProjectSettings = async (
  payload: ProjectSettingsPayload,
): Promise<ProjectSettings> => {
  const client = ensureSupabase()

  const parsedDeadline = new Date(payload.deadline)

  const row = {
    id: 1,
    title: normalizeValue(payload.title),
    description: normalizeValue(payload.description),
    tasks_python: payload.tasks_python.trim(),
    deliverables: payload.deliverables.trim(),
    pedagogical_objectives: payload.pedagogical_objectives.trim(),
    submission_rules: payload.submission_rules.trim(),
    deadline: Number.isNaN(parsedDeadline.getTime())
      ? defaultProjectSettings.deadline
      : parsedDeadline.toISOString(),
    updated_at: nowIso(),
  }

  const { data, error } = await client
    .from('project_settings')
    .upsert(row)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapSettingsRow(data)
}

export const upsertDataset = async (payload: DatasetPayload): Promise<Dataset> => {
  const client = ensureSupabase()

  if (!normalizeValue(payload.name)) {
    throw new Error('Le nom du dataset est obligatoire.')
  }

  let filePath = payload.currentFilePath

  if (payload.csvFile) {
    const csvName = sanitizeFileName(payload.csvFile.name)
    const destination = `datasets/${Date.now()}-${csvName}`

    const { error: uploadError } = await client.storage
      .from(PROJECT_STORAGE_BUCKET)
      .upload(destination, payload.csvFile, {
        upsert: true,
        cacheControl: '3600',
        contentType: payload.csvFile.type || 'text/csv',
      })

    if (uploadError) {
      throw uploadError
    }

    filePath = destination
  }

  const row = {
    name: normalizeValue(payload.name),
    description: payload.description.trim(),
    file_path: filePath,
  }

  if (payload.id) {
    const { data, error } = await client
      .from('datasets')
      .update(row)
      .eq('id', payload.id)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return mapDatasetRow(data)
  }

  const { data, error } = await client
    .from('datasets')
    .insert(row)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapDatasetRow(data)
}

export const deleteDataset = async (
  datasetId: string,
  filePath: string | null,
): Promise<void> => {
  const client = ensureSupabase()

  if (filePath) {
    await client.storage.from(PROJECT_STORAGE_BUCKET).remove([filePath])
  }

  const { error } = await client.from('datasets').delete().eq('id', datasetId)

  if (error) {
    throw error
  }
}

export const updateGroup = async (payload: GroupUpdatePayload): Promise<Group> => {
  const client = ensureSupabase()

  const student1Name = normalizeValue(payload.student1Name)

  if (!student1Name) {
    throw new Error('Le nom de l etudiant 1 est obligatoire.')
  }

  if (!payload.datasetId) {
    throw new Error('Selectionnez un dataset avant de sauvegarder.')
  }

  const row = {
    group_name: payload.groupName ? normalizeValue(payload.groupName) : null,
    student1_name: student1Name,
    student2_name: payload.student2Name ? normalizeValue(payload.student2Name) : null,
    student3_name: payload.student3Name ? normalizeValue(payload.student3Name) : null,
    dataset_id: payload.datasetId,
  }

  const { data, error } = await client
    .from('groups')
    .update(row)
    .eq('id', payload.id)
    .select('*, datasets(name)')
    .single()

  if (error) {
    throw error
  }

  return mapGroupRow(data)
}

export const deleteGroup = async (groupId: string): Promise<void> => {
  const client = ensureSupabase()

  const { error } = await client.from('groups').delete().eq('id', groupId)

  if (error) {
    throw error
  }
}

export const fetchCurrentSession = async (): Promise<Session | null> => {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export const signInAdmin = async (
  email: string,
  password: string,
): Promise<void> => {
  const client = ensureSupabase()

  const { error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    throw error
  }
}

export const signOutAdmin = async (): Promise<void> => {
  const client = ensureSupabase()
  const { error } = await client.auth.signOut()

  if (error) {
    throw error
  }
}
