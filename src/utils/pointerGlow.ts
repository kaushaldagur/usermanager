import type { MouseEvent } from "react";

/**
 * Tracks the pointer position over a glass surface and exposes it as CSS
 * variables (--mx, --my). The stylesheet uses these to move a soft specular
 * highlight across the element, mimicking how light slides across real glass
 * as you change your viewing angle (Apple's "Liquid Glass" material).
 *
 * Implemented as a plain DOM write (no React state) so it stays smooth at
 * 60fps and never triggers a re-render.
 */
export function handlePointerMove(event: MouseEvent<HTMLElement>) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  target.style.setProperty("--mx", `${x}%`);
  target.style.setProperty("--my", `${y}%`);
}

/** Resets the highlight to a neutral resting position when the pointer leaves. */
export function handlePointerLeave(event: MouseEvent<HTMLElement>) {
  const target = event.currentTarget;
  target.style.setProperty("--mx", "50%");
  target.style.setProperty("--my", "20%");
}
