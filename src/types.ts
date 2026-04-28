export type Dataset = {
  id: string
  name: string
  description: string
  file_path: string | null
  file_url: string | null
  created_at: string
}

export type Group = {
  id: string
  group_name: string | null
  student1_name: string
  student2_name: string | null
  student3_name: string | null
  dataset_id: string | null
  dataset_name: string | null
  created_at: string
}

export type ProjectSettings = {
  id: number
  title: string
  description: string
  tasks_python: string
  deliverables: string
  pedagogical_objectives: string
  submission_rules: string
  deadline: string
  project_pdf_path: string | null
  project_pdf_url: string | null
  updated_at: string
}

export type GroupRegistrationPayload = {
  groupName: string
  student1Name: string
  student2Name: string
  student3Name: string
  datasetId: string
}

export type GroupUpdatePayload = {
  id: string
  groupName: string | null
  student1Name: string
  student2Name: string | null
  student3Name: string | null
  datasetId: string
}

export type ProjectSettingsPayload = {
  title: string
  description: string
  tasks_python: string
  deliverables: string
  pedagogical_objectives: string
  submission_rules: string
  deadline: string
}

export type DatasetPayload = {
  id: string | null
  name: string
  description: string
  csvFile: File | null
  currentFilePath: string | null
}

export type AdminOverview = {
  groups: Group[]
  datasets: Dataset[]
  settings: ProjectSettings
}
