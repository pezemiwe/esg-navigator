const API_BASE = "/api";

function headers(userId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-user-id": userId,
  };
}

export interface ProjectApiEntity {
  id: string;
  name: string;
  parentId: string | null;
  sectorId: string;
  subSector: string;
  relationshipType: string;
  governanceJson: string;
  valueChainJson: string;
  phase4Json: string;
  phase5Json: string;
  srroItems?: Array<{
    ref: string;
    source?: string;
    title: string;
    description?: string;
    type?: string;
    valueChainStage?: string;
    financialImpact?: string;
    strategicImpact?: string;
    operationalImpact?: string;
    timeHorizon?: string;
    likelihood?: number;
    magnitude?: number;
    neededByPrimaryUser?: string;
    includeInFinalList?: string;
    srroCrro?: string;
  }>;
}

export interface ProjectApiPayload {
  groupName?: string;
  isGroupAssessment?: boolean;
  activeEntityId?: string;
  entities?: ProjectApiEntity[];
}

export async function apiCreateProject(
  userId: string,
  payload: { groupName: string; isGroupAssessment: boolean },
): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create project failed: ${res.status}`);
  return res.json();
}

export async function apiSaveProject(
  userId: string,
  projectId: string,
  payload: ProjectApiPayload,
): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Save project failed: ${res.status}`);
}

export async function apiDeleteProject(
  userId: string,
  projectId: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "DELETE",
    headers: headers(userId),
  });
  if (!res.ok && res.status !== 404) throw new Error(`Delete project failed: ${res.status}`);
}
