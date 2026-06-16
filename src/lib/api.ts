import type {
  AdminDetail,
  AdminListItem,
  AnswerMap,
  PublicRecord,
  StudentProfile,
  SurveyKey,
} from "../types";

const jsonHeaders = {
  "Content-Type": "application/json",
};

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  adminToken?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (adminToken) {
    headers.set("Authorization", `Bearer ${adminToken}`);
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function createRecord() {
  return apiRequest<{ record: PublicRecord }>("/api/public/records", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({}),
  });
}

export function saveProfile(accessCode: string, profile: StudentProfile) {
  return apiRequest<{ record: PublicRecord }>(
    `/api/public/records/${encodeURIComponent(accessCode)}/profile`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ profile }),
    },
  );
}

export function saveSurveySection(
  accessCode: string,
  surveyKey: SurveyKey,
  answers: AnswerMap,
  completed: boolean,
) {
  return apiRequest<{ record: PublicRecord }>(
    `/api/public/records/${encodeURIComponent(accessCode)}/surveys/${surveyKey}`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ answers, completed }),
    },
  );
}

export function adminLogin(password: string) {
  return apiRequest<{ token: string }>("/api/admin/login", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ password }),
  });
}

export function listAdminRecords(token: string) {
  return apiRequest<{ records: AdminListItem[] }>("/api/admin/records", {}, token);
}

export function getAdminRecord(id: string, token: string) {
  return apiRequest<{ record: AdminDetail }>(
    `/api/admin/records/${encodeURIComponent(id)}`,
    {},
    token,
  );
}

export function deleteAdminRecord(id: string, token: string) {
  return apiRequest<{ ok: true }>(
    `/api/admin/records/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    token,
  );
}

export async function downloadAdminCsv(token: string) {
  const response = await fetch("/api/admin/export.csv", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("CSV export failed");
  }

  return await response.blob();
}
