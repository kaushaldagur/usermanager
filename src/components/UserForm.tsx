import { useMemo, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import type { UserInput } from "../types/user";

type FormErrors = Partial<Record<keyof UserInput, string>>;

type UserFormProps = {
  initialValues?: UserInput;
  submitLabel: string;
  busy: boolean;
  onSubmit: (input: UserInput) => Promise<void>;
};

const emptyValues: UserInput = {
  name: "",
  email: "",
  phone: "",
  address: "",
  profession: "",
};

export default function UserForm({
  initialValues,
  submitLabel,
  busy,
  onSubmit,
}: UserFormProps) {
  const [values, setValues] = useState<UserInput>(initialValues ?? emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues ?? emptyValues),
    [values, initialValues]
  );

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!values.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address?.trim(),
        profession: values.profession?.trim(),
      });
    } catch {
      setSubmitError("The API request failed. Please check your connection and try again.");
    }
  };

  return (
    <form className="user-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <p className="form-alert" role="alert">
          {submitError}
        </p>
      )}

      <label>
        <span>Name</span>
        <input
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          placeholder="Leanne Graham"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <small>{errors.name}</small>}
      </label>

      <label>
        <span>Email</span>
        <input
          type="email"
          value={values.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
          placeholder="leanne@example.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <small>{errors.email}</small>}
      </label>

      <label>
        <span>Phone</span>
        <input
          value={values.phone}
          onChange={(event) => setValues({ ...values, phone: event.target.value })}
          placeholder="1-770-736-8031"
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone && <small>{errors.phone}</small>}
      </label>

      <label>
        <span>Address</span>
        <input
          value={values.address ?? ""}
          onChange={(event) =>
            setValues({ ...values, address: event.target.value })
          }
          placeholder="Kulas Light, Gwenborough"
        />
      </label>

      <label>
        <span>Profession</span>
        <input
          value={values.profession ?? ""}
          onChange={(event) =>
            setValues({ ...values, profession: event.target.value })
          }
          placeholder="Product Manager"
        />
      </label>

      <button className="primary-action" type="submit" disabled={busy || !isDirty}>
        <Save size={18} aria-hidden="true" />
        {busy ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
