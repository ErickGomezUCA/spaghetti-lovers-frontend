import { Auth } from "@/types/api-responses";
import { ApiError } from "../exceptions/api-exceptions";
import { localStorageClient } from "./local-storage-client";
import { authClient } from "./auth-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authClient.getAuth()?.token;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(
      error.message ?? error.data.message ?? "Request failed",
      res.status,
    );
  }

  return res.json();
}

async function requestForm<T>(path: string, body: FormData): Promise<T> {
  const token = authClient.getAuth()?.token;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(
      error.message ?? error.data?.message ?? "Upload failed",
      res.status,
    );
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, body: FormData) => requestForm<T>(path, body),
};
