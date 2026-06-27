import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import UserForm from "../components/UserForm";
import { useUsers } from "../context/UserContext";
import type { UserInput } from "../types/user";
import { handlePointerMove, handlePointerLeave } from "../utils/pointerGlow";

type UserFormPageProps = {
  mode: "create" | "edit";
};

export default function UserFormPage({ mode }: UserFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addUser, editUser, findUser, loading } = useUsers();
  const [busy, setBusy] = useState(false);
  const user = mode === "edit" && id ? findUser(Number(id)) : undefined;

  const initialValues: UserInput | undefined = user
    ? {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: [user.address?.suite, user.address?.street, user.address?.city]
          .filter(Boolean)
          .join(", "),
        profession: user.company?.name ?? "",
      }
    : undefined;

  const handleSubmit = async (input: UserInput) => {
    setBusy(true);
    try {
      const saved =
        mode === "create" ? await addUser(input) : await editUser(Number(id), input);
      navigate(`/users/${saved.id}`);
    } finally {
      setBusy(false);
    }
  };

  if (mode === "edit" && loading) {
    return (
      <section className="state-panel">
        <h1>Loading user</h1>
        <p>The form will be ready shortly.</p>
      </section>
    );
  }

  if (mode === "edit" && !user) {
    return (
      <section className="state-panel">
        <h1>User not found</h1>
        <p>This user is not available for editing.</p>
        <Link className="secondary-action" to="/">
          Back to users
        </Link>
      </section>
    );
  }

  return (
    <>
      <Link className="back-link" to={mode === "edit" && user ? `/users/${user.id}` : "/"}>
        <ArrowLeft size={17} aria-hidden="true" />
        {mode === "edit" ? "Back to profile" : "Back to users"}
      </Link>

      <section className="form-page" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
        <header className="form-title">
          <h1>{mode === "edit" ? "Edit user" : "Add user"}</h1>
          <p>{mode === "edit" ? "Update the selected user." : "Create a new user."}</p>
        </header>
        <UserForm
          initialValues={initialValues}
          submitLabel={mode === "edit" ? "Save changes" : "Create user"}
          busy={busy}
          onSubmit={handleSubmit}
        />
      </section>
    </>
  );
}
