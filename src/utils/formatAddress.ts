import type { Address } from "../types/user";

export function formatAddress(address?: Address) {
  return [address?.suite, address?.street, address?.city, address?.zipcode]
    .filter(Boolean)
    .join(", ");
}

export function formatShortLocation(address?: Address) {
  return address?.city || address?.street || formatAddress(address);
}
