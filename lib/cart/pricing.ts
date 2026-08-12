export function effectiveUnitPrice(
  actualMinorUnits: number,
  pilotPrice = process.env.CHECKOUT_PILOT_UNIT_PRICE_AED
): number {
  if (!pilotPrice) return actualMinorUnits;
  if (!/^\d+(?:\.\d{1,2})?$/.test(pilotPrice)) {
    throw new Error(
      "CHECKOUT_PILOT_UNIT_PRICE_AED must be a positive AED amount with at most two decimals."
    );
  }
  const minorUnits = Math.round(Number(pilotPrice) * 100);
  if (minorUnits < 1) throw new Error("CHECKOUT_PILOT_UNIT_PRICE_AED must be at least AED 0.01.");
  return minorUnits;
}
