import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createUser, deleteUser, getUsers, updateUser } from "../api/users";
import type { User, UserInput } from "../types/user";
import {
  applyLocalChanges,
  CUSTOM_ID_THRESHOLD,
  loadCustomUsers,
  loadDeletedIds,
  loadOverrides,
  loadSnapshot,
  saveCustomUsers,
  saveDeletedIds,
  saveOverrides,
  saveSnapshot,
} from "../utils/storage";

type Notice = {
  tone: "success" | "error";
  message: string;
};

type UserContextValue = {
  users: User[];
  loading: boolean;
  notice: Notice | null;
  loadError: string | null;
  clearNotice: () => void;
  retryUsers: () => Promise<void>;
  findUser: (id: number) => User | undefined;
  addUser: (input: UserInput) => Promise<User>;
  editUser: (id: number, input: UserInput) => Promise<User>;
  removeUser: (id: number) => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

/** Builds the full User record a form submission turns into. */
function buildUser(id: number, input: UserInput, existing?: User): User {
  return {
    ...existing,
    id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    username: existing?.username ?? (input.name.split(" ")[0] || "newuser"),
    address:
      input.address !== undefined
        ? { ...existing?.address, street: input.address }
        : existing?.address,
    company:
      input.profession !== undefined
        ? { ...existing?.company, name: input.profession }
        : existing?.company,
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const retryUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    // Paint instantly from the last known-good snapshot while the network
    // request is in flight, instead of showing a blank/skeleton state for
    // users who already have data cached locally.
    const cached = loadSnapshot();
    if (cached.length > 0) {
      setUsers(applyLocalChanges(cached));
    }

    try {
      const [data] = await Promise.all([
        getUsers(),
        new Promise((resolve) => window.setTimeout(resolve, 500)),
      ]);

      const merged = applyLocalChanges(data);
      setUsers(merged);
      saveSnapshot(data); // store the raw API list; local diffs are reapplied on top each time
    } catch {
      // Network failed — fall back to whatever we already have cached.
      if (cached.length === 0) {
        setLoadError("Users could not be loaded. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void retryUsers();
  }, [retryUsers]);

  const clearNotice = () => setNotice(null);

  const findUser = useCallback(
    (id: number) => users.find((user) => user.id === id),
    [users]
  );

  const addUser = async (input: UserInput) => {
    try {
      // Simulated — JSONPlaceholder accepts the POST and echoes it back,
      // but never actually persists it server-side.
      await createUser(input);
    } catch {
      // Even if the simulated request fails, keep the user locally.
    }

    const newUser = buildUser(Date.now() + Math.floor(Math.random() * 1000), input);

    const updatedCustom = [newUser, ...loadCustomUsers()];
    saveCustomUsers(updatedCustom);

    setUsers((current) => [newUser, ...current]);
    setNotice({ tone: "success", message: `${input.name} was added.` });
    return newUser;
  };

  const editUser = async (id: number, input: UserInput) => {
    try {
      // Simulated — see addUser.
      await updateUser(id, input);
    } catch {
      // Keep the edit locally even if the simulated request fails.
    }

    const existingUser = findUser(id);
    const updatedUser = buildUser(id, input, existingUser);

    if (id >= CUSTOM_ID_THRESHOLD) {
      // A locally-created user — update it in place in custom storage.
      const updatedCustom = loadCustomUsers().map((user) =>
        user.id === id ? updatedUser : user
      );
      saveCustomUsers(updatedCustom);
    } else {
      // An original API user — store the edit as an override so it's
      // re-applied on top of the (unchanging) API response on every
      // future fetch, instead of being silently overwritten by it.
      const overrides = loadOverrides();
      overrides[String(id)] = updatedUser;
      saveOverrides(overrides);
    }

    setUsers((current) =>
      current.map((user) => (user.id === id ? updatedUser : user))
    );
    setNotice({ tone: "success", message: `${input.name} was updated.` });
    return updatedUser;
  };

  const removeUser = async (id: number) => {
    const user = findUser(id);

    try {
      // Simulated — see addUser.
      await deleteUser(id);
    } catch {
      // Keep the deletion locally even if the simulated request fails.
    }

    if (id >= CUSTOM_ID_THRESHOLD) {
      // A locally-created user — just drop it, it never existed on the API.
      saveCustomUsers(loadCustomUsers().filter((u) => u.id !== id));
    } else {
      // An original API user — remember it's deleted so it's filtered out
      // of every future fetch, and clear any override stored for it.
      const deletedIds = loadDeletedIds();
      if (!deletedIds.includes(id)) {
        saveDeletedIds([...deletedIds, id]);
      }
      const overrides = loadOverrides();
      if (overrides[String(id)]) {
        delete overrides[String(id)];
        saveOverrides(overrides);
      }
    }

    setUsers((current) => current.filter((item) => item.id !== id));
    setNotice({
      tone: "success",
      message: user ? `${user.name} was removed.` : "User was removed.",
    });
  };

  const value = useMemo(
    () => ({
      users,
      loading,
      notice,
      loadError,
      clearNotice,
      retryUsers,
      findUser,
      addUser,
      editUser,
      removeUser,
    }),
    [users, loading, notice, loadError, retryUsers, findUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUsers must be used inside UserProvider");
  }

  return context;
}
