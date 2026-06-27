import type { User } from "../types/user";

const CUSTOM_USERS_KEY = "usermanager_custom_users";
const OVERRIDES_KEY = "usermanager_overrides";
const DELETED_IDS_KEY = "usermanager_deleted_ids";
const SNAPSHOT_KEY = "usermanager_snapshot";

export const CUSTOM_ID_THRESHOLD = 1_000_000;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch (error) {
    console.error(`Failed to read "${key}" from storage:`, error);
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write "${key}" to storage:`, error);
  }
}

export function loadCustomUsers(): User[] {
  return readJSON<User[]>(CUSTOM_USERS_KEY, []);
}

export function saveCustomUsers(users: User[]): void {
  writeJSON(CUSTOM_USERS_KEY, users);
}

export function loadOverrides(): Record<string, User> {
  return readJSON<Record<string, User>>(OVERRIDES_KEY, {});
}

export function saveOverrides(overrides: Record<string, User>): void {
  writeJSON(OVERRIDES_KEY, overrides);
}

export function loadDeletedIds(): number[] {
  return readJSON<number[]>(DELETED_IDS_KEY, []);
}

export function saveDeletedIds(ids: number[]): void {
  writeJSON(DELETED_IDS_KEY, ids);
}

export function loadSnapshot(): User[] {
  return readJSON<User[]>(SNAPSHOT_KEY, []);
}

export function saveSnapshot(users: User[]): void {
  writeJSON(SNAPSHOT_KEY, users);
}

export function applyLocalChanges(apiUsers: User[]): User[] {
  const overrides = loadOverrides();
  const deletedIds = loadDeletedIds();
  const customUsers = loadCustomUsers().filter(
    (user) => !deletedIds.includes(user.id)
  );

  const mergedApiUsers = apiUsers
    .filter((user) => !deletedIds.includes(user.id))
    .map((user) => overrides[String(user.id)] ?? user);

  return [...customUsers, ...mergedApiUsers];
}
