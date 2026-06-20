import { Auth } from "@/types/api-responses";
import { localStorageClient } from "./local-storage-client";

function getAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  return localStorageClient.get("auth") as Auth | null;
}

function saveAuth(auth: Auth): void {
  if (typeof window === "undefined") return;
  localStorageClient.save("auth", auth);
}

function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorageClient.remove("auth");
}

export const authClient = {
  getAuth,
  saveAuth,
  clearAuth,
};
