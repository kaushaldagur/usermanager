import { Link } from "react-router-dom";
import { ChevronRight, Edit3, MapPin, Trash2 } from "lucide-react";
import type { User } from "../types/user";
import { formatShortLocation } from "../utils/formatAddress";
import { handlePointerMove, handlePointerLeave } from "../utils/pointerGlow";

type UserListProps = {
  users: User[];
  deletingId: number | null;
  onDelete: (user: User) => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function UserList({ users, deletingId, onDelete }: UserListProps) {
  return (
    <section className="directory-list" aria-label="Users">
      {users.map((user) => {
        const profession = user.company?.name ?? "Contact";
        const location = formatShortLocation(user.address);

        return (
          <article
            className="user-row"
            key={user.id}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
          >
            <Link
              className="row-main"
              to={`/users/${user.id}`}
              aria-label={`Open profile for ${user.name}`}
            >
              <div className="identity-cell">
                <span className="avatar">{initials(user.name)}</span>
                <div>
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="card-meta">
                <span>{profession}</span>
                {location && (
                  <small className="location-chip">
                    <MapPin size={13} aria-hidden="true" />
                    {location}
                  </small>
                )}
              </div>

              <p className="phone-cell">{user.phone}</p>
            </Link>

            <ChevronRight className="row-chevron" size={18} aria-hidden="true" />

            <div className="row-actions" aria-label={`Actions for ${user.name}`}>
              <Link className="icon-button" to={`/users/${user.id}/edit`} aria-label="Edit user">
                <Edit3 size={16} aria-hidden="true" />
              </Link>
              <button
                className="icon-button danger"
                type="button"
                onClick={() => onDelete(user)}
                disabled={deletingId === user.id}
                aria-label="Delete user"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
