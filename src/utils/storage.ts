import type { User } from "../types/user";

/**
 * Everything here exists because JSONPlaceholder is a fake API: writes are
 * "accepted" and echoed back, but never actually saved server-side. A
 * refetch always returns the same fixed 10 users. So to make create/update/
 * delete feel real across a page reload, we keep a small local diff on top
 * of whatever the API returns:
 *
 *  - CUSTOM_USERS_KEY   users created locally (id >= CUSTOM_ID_THRESHOLD).
 *                       These never come back from the API, so they're
 *                       stored in full and re-prepended after every fetch.
 *  - OVERRIDES_KEY      edits made to an *original* API user, keyed by id.
 *                       Re-applied on top of the freshly fetched copy of
 *                       that user so edits survive a refetch/reload.
 *  - DELETED_IDS_KEY    ids of original API users that were deleted.
 *                       Filtered out of every future fetch.
 *  - SNAPSHOT_KEY       the last fully-resolved user list, used only to
 *                       paint the UI instantly on load, before the network
 *                       request resolves.
 */

const CUSTOM_USERS_KEY = "usermanager_custom_users";
const OVERRIDES_KEY = "usermanager_overrides";
const DELETED_IDS_KEY = "usermanager_deleted_ids";
const SNAPSHOT_KEY = "usermanager_snapshot";

/** Ids at or above this are locally-created users, never API users. */
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

/** Users created locally (never exist on the real API). */
export function loadCustomUsers(): User[] {
  return readJSON<User[]>(CUSTOM_USERS_KEY, []);
}

export function saveCustomUsers(users: User[]): void {
  writeJSON(CUSTOM_USERS_KEY, users);
}

/** Edits applied on top of an original API user, keyed by user id. */
export function loadOverrides(): Record<string, User> {
  return readJSON<Record<string, User>>(OVERRIDES_KEY, {});
}

export function saveOverrides(overrides: Record<string, User>): void {
  writeJSON(OVERRIDES_KEY, overrides);
}

/** Ids of original API users that have been deleted locally. */
export function loadDeletedIds(): number[] {
  return readJSON<number[]>(DELETED_IDS_KEY, []);
}

export function saveDeletedIds(ids: number[]): void {
  writeJSON(DELETED_IDS_KEY, ids);
}

/** Last fully-resolved list, used only to paint instantly before refetch. */
export function loadSnapshot(): User[] {
  return readJSON<User[]>(SNAPSHOT_KEY, []);
}

export function saveSnapshot(users: User[]): void {
  writeJSON(SNAPSHOT_KEY, users);
}

/**
 * Combines a freshly-fetched (or cached) API user list with everything
 * stored locally: deletions are filtered out, overrides are applied on top
 * of matching API users, and locally-created users are prepended.
 */
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

/** Clears every locally-stored diff and snapshot. */
export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(CUSTOM_USERS_KEY);
    localStorage.removeItem(OVERRIDES_KEY);
    localStorage.removeItem(DELETED_IDS_KEY);
    localStorage.removeItem(SNAPSHOT_KEY);
  } catch (error) {
    console.error("Failed to clear storage:", error);
  }
}
