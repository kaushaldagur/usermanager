import type { User } from "../types/user";
import { handlePointerMove, handlePointerLeave } from "../utils/pointerGlow";

type ConfirmDialogProps = {
  user: User | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

// Modeled on a UIAlertController: a glass card, a centered message, and a
// row of text-only buttons split by a hairline rather than filled pills.
export default function ConfirmDialog({
  user,
  busy,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!user) return null;

  return (
    <div className="modal-layer" role="presentation">
      <section
        className="ios-alert"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        <div className="ios-alert-body">
          <p className="eyebrow">Delete user</p>
          <h2 id="delete-title">Remove {user.name}?</h2>
          <p>
            This sends a DELETE request to JSONPlaceholder and removes the user
            from this directory view.
          </p>
        </div>
        <div className="dialog-actions">
          <button type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </section>
    </div>
  );
}
