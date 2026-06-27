import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, Plus, Search } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import SkeletonList from "../components/SkeletonList";
import UserList from "../components/UserList";
import { useUsers } from "../context/UserContext";
import type { User } from "../types/user";
import { handlePointerMove, handlePointerLeave } from "../utils/pointerGlow";

export default function HomePage() {
  const { users, loading, loadError, retryUsers, removeUser } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) return users;

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.phone,
        user.company?.name,
        user.address?.city,
        user.address?.street,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(searchTerm))
    );
  }, [query, users]);

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setDeletingId(selectedUser.id);
    try {
      await removeUser(selectedUser.id);
      setSelectedUser(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="home-head" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
        <div>
          <p className="eyebrow">People desk</p>
          <h1>User records</h1>
          <p>
            {loading
              ? "Sorting the directory..."
              : `${filteredUsers.length} of ${users.length} user records`}
          </p>
        </div>
        <Link className="primary-action" to="/users/new">
          <Plus size={18} aria-hidden="true" />
          Add user
        </Link>
      </section>

      <section className="search-panel" aria-label="Search users">
        <label className="search-field" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
          {loading ? (
            <LoaderCircle className="search-spinner" size={19} aria-hidden="true" />
          ) : (
            <Search size={19} aria-hidden="true" />
          )}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={loading ? "Loading users..." : "Search name, email, phone, profession, city"}
            disabled={loading}
          />
        </label>
      </section>

      {loading && <SkeletonList />}

      {!loading && loadError && (
        <section className="state-panel" role="alert">
          <h2>Users could not be loaded</h2>
          <p>{loadError}</p>
          <button className="secondary-action" type="button" onClick={retryUsers}>
            Try again
          </button>
        </section>
      )}

      {!loading && !loadError && users.length === 0 && (
        <section className="state-panel">
          <h2>No users found</h2>
          <p>Add a user to begin.</p>
        </section>
      )}

      {!loading && !loadError && users.length > 0 && filteredUsers.length === 0 && (
        <section className="state-panel">
          <h2>No matching users</h2>
          <p>Try another name, email, phone, profession, or city.</p>
        </section>
      )}

      {!loading && !loadError && filteredUsers.length > 0 && (
        <UserList
          users={filteredUsers}
          deletingId={deletingId}
          onDelete={setSelectedUser}
        />
      )}

      <ConfirmDialog
        user={selectedUser}
        busy={deletingId !== null}
        onCancel={() => setSelectedUser(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
