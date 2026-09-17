import type { Settlement, Token, UserProfile, UserResponse, UserSettlementDetail, UserSettlementListItem, UserSettlementResponse, UserSettlementUpdate, UserUpdate } from "../types/api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8000";
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : `Request failed (${response.status})`;
    throw new ApiError(response.status, detail);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  register: (username: string, password: string) => request<UserResponse>("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),
  login: (username: string, password: string) => request<Token>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  getSettlements: () => request<Settlement[]>("/settlements/"),
  getSettlement: (name: string) => request<Settlement>(`/settlements/${encodeURIComponent(name)}`),
  getMe: (token: string) => request<UserProfile>("/users/me", {}, token),
  updateMe: (data: UserUpdate, token: string) => request<UserProfile>("/users/me", { method: "PATCH", body: JSON.stringify(data) }, token),
  deleteMe: (token: string) => request<void>("/users/me", { method: "DELETE" }, token),
  getMySettlements: (token: string) => request<UserSettlementListItem[]>("/my-settlements/", {}, token),
  unlockSettlement: (settlementId: number, token: string) => request<UserSettlementResponse>(`/my-settlements/${settlementId}`, { method: "POST" }, token),
  getMySettlement: (settlementId: number, token: string) => request<UserSettlementDetail>(`/my-settlements/${settlementId}`, {}, token),
  updateMySettlement: (settlementId: number, data: UserSettlementUpdate, token: string) => request<UserSettlementResponse>(`/my-settlements/${settlementId}`, { method: "PATCH", body: JSON.stringify(data) }, token),
  deleteMySettlement: (settlementId: number, token: string) => request<void>(`/my-settlements/${settlementId}`, { method: "DELETE" }, token),
};
