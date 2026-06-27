import type { User, UserInput } from "../types/user";

const API_BASE = "https://jsonplaceholder.typicode.com";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getUsers(): Promise<User[]> {
  return request<User[]>("/users");
}

export function createUser(user: UserInput): Promise<User> {
  return request<User>("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function updateUser(id: number, user: UserInput): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, ...user }),
  });
}

export async function deleteUser(id: number): Promise<void> {
  await request<Record<string, never>>(`/users/${id}`, {
    method: "DELETE",
  });
}
