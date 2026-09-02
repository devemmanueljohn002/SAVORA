/**
 * Formats a Naira amount, e.g. 10500 -> "₦10,500".
 * Never format prices with manual string interpolation elsewhere — always use this.
 */
export function formatCurrency(amountInNaira: number): string {
  return `₦${Math.round(amountInNaira).toLocaleString("en-NG")}`;
}

export function formatDeliveryTime(range: [number, number]): string {
  const [min, max] = range;
  return `${min}–${max} min`;
}

export function formatDistance(km: number | undefined): string | null {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}
