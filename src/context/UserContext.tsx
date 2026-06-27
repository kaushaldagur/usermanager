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
      saveSnapshot(data);
    } catch {
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
      await createUser(input);
    } catch {
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
      await updateUser(id, input);
    } catch {
    }

    const existingUser = findUser(id);
    const updatedUser = buildUser(id, input, existingUser);

    if (id >= CUSTOM_ID_THRESHOLD) {
      const updatedCustom = loadCustomUsers().map((user) =>
        user.id === id ? updatedUser : user
      );
      saveCustomUsers(updatedCustom);
    } else {
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
      await deleteUser(id);
    } catch {
    }

    if (id >= CUSTOM_ID_THRESHOLD) {
      saveCustomUsers(loadCustomUsers().filter((u) => u.id !== id));
    } else {
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
