import type { MouseEvent } from "react";

export function handlePointerMove(event: MouseEvent<HTMLElement>) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  target.style.setProperty("--mx", `${x}%`);
  target.style.setProperty("--my", `${y}%`);
}

export function handlePointerLeave(event: MouseEvent<HTMLElement>) {
  const target = event.currentTarget;
  target.style.setProperty("--mx", "50%");
  target.style.setProperty("--my", "20%");
}
