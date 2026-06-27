import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Edit3, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { useUsers } from "../context/UserContext";
import type { User } from "../types/user";
import { formatAddress } from "../utils/formatAddress";
import { handlePointerMove, handlePointerLeave } from "../utils/pointerGlow";

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { findUser, removeUser, loading } = useUsers();
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const user = id ? findUser(Number(id)) : undefined;

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await removeUser(deleteTarget.id);
      navigate("/");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="state-panel">
        <h1>Loading profile</h1>
        <p>The user record is being prepared.</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="state-panel">
        <h1>User not found</h1>
        <p>This profile is not available in the current directory.</p>
        <Link className="secondary-action" to="/">
          Back to users
        </Link>
      </section>
    );
  }

  const address = formatAddress(user.address);
  const profession = user.company?.name || "Not provided";
  const professionNote = user.company?.catchPhrase || user.company?.bs || "";

  return (
    <>
      <Link className="back-link" to="/">
        <ArrowLeft size={17} aria-hidden="true" />
        Back to users
      </Link>

      <section className="profile-hero" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
        <div className="profile-initial">{user.name.slice(0, 1)}</div>
        <div>
          <h1>{user.name}</h1>
          <p>{profession}</p>
        </div>
        <div className="profile-actions">
          <Link className="secondary-action" to={`/users/${user.id}/edit`}>
            <Edit3 size={17} aria-hidden="true" />
            Edit
          </Link>
          <button
            className="danger-action"
            type="button"
            onClick={() => setDeleteTarget(user)}
          >
            <Trash2 size={17} aria-hidden="true" />
            Delete
          </button>
        </div>
      </section>

      <section className="detail-grid">
        <article onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
          <Mail size={20} aria-hidden="true" />
          <span>Email</span>
          <strong>{user.email}</strong>
        </article>
        <article onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
          <Phone size={20} aria-hidden="true" />
          <span>Phone</span>
          <strong>{user.phone}</strong>
        </article>
        <article onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
          <MapPin size={20} aria-hidden="true" />
          <span>Address</span>
          <strong>{address || "Not provided"}</strong>
        </article>
      </section>

      <section className="profession-card" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
        <div>
          <BriefcaseBusiness size={22} aria-hidden="true" />
          <span>Profession</span>
        </div>
        <h2>{profession}</h2>
        {professionNote && <p>{professionNote}</p>}
      </section>

      <ConfirmDialog
        user={deleteTarget}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
