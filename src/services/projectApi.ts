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
  payload: { id: string; groupName: string; isGroupAssessment: boolean },
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

export interface ProjectApiServerEntity {
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
  srroItems: Array<{
    id: string;
    ref: string;
    source: string;
    title: string;
    description: string;
    type: string;
    valueChainStage: string;
    financialImpact: string;
    strategicImpact: string;
    operationalImpact: string;
    timeHorizon: string;
    likelihood: number;
    magnitude: number;
    neededByPrimaryUser: string;
    includeInFinalList: string;
    srroCrro: string;
  }>;
}

export interface ProjectApiServerProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  groupName: string;
  isGroupAssessment: boolean;
  activeEntityId: string;
  entities: ProjectApiServerEntity[];
}

export async function apiLoadProject(
  userId: string,
  projectId: string,
): Promise<ProjectApiServerProject> {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    headers: headers(userId),
  });
  if (!res.ok) throw new Error(`Load project failed: ${res.status}`);
  return res.json();
}

export async function apiListProjects(
  userId: string,
): Promise<{ id: string; groupName: string; isGroupAssessment: boolean; createdAt: string; updatedAt: string }[]> {
  const res = await fetch(`${API_BASE}/projects`, { headers: headers(userId) });
  if (!res.ok) throw new Error(`List projects failed: ${res.status}`);
  const data = await res.json() as { projects: { id: string; groupName: string; isGroupAssessment: boolean; createdAt: string; updatedAt: string }[] };
  return data.projects;
}

const PROXY_OFFLINE_STATUSES = new Set([500, 502, 503, 504]);

export function isProjectApiOfflineStatus(status: number): boolean {
  return PROXY_OFFLINE_STATUSES.has(status);
}

/** True when the projects API is down or unreachable (proxy/network errors). */
export function isProjectApiUnreachableError(err: unknown): boolean {
  if (err && typeof err === "object" && "unreachable" in err && (err as { unreachable: boolean }).unreachable) {
    return true;
  }
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("failed to fetch")
      || msg.includes("network")
      || msg.includes("load failed")
      || msg.includes("econnrefused")
      || msg.includes("delete project failed: 500")
      || msg.includes("list projects failed: 500")
    );
  }
  return false;
}

function unreachableDeleteError(cause: unknown): Error {
  const err = cause instanceof Error ? cause : new Error(String(cause));
  return Object.assign(err, { unreachable: true as const });
}

export async function apiDeleteProject(
  userId: string,
  projectId: string,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: "DELETE",
      headers: headers(userId),
    });
  } catch (err) {
    throw unreachableDeleteError(err);
  }
  if (res.status === 404) return;
  if (isProjectApiOfflineStatus(res.status)) {
    throw unreachableDeleteError(new Error(`Delete project failed: ${res.status}`));
  }
  if (!res.ok) throw new Error(`Delete project failed: ${res.status}`);
}
