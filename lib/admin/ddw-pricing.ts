export type DdwOffer = {
  discountPercent: number;
  twoLampDiscountFils: number;
  threePlusLampDiscountFils: number;
};

type QuoteLine = {
  quantity: number;
  unitPriceFils: number;
};

export function calculateDdwQuote(lines: QuoteLine[], offer: DdwOffer) {
  const quantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalFils = lines.reduce((sum, line) => sum + line.quantity * line.unitPriceFils, 0);
  const eventDiscountFils = Math.round((subtotalFils * offer.discountPercent) / 100);
  const afterEventDiscountFils = subtotalFils - eventDiscountFils;
  const bundleDiscountFils = Math.min(
    afterEventDiscountFils,
    quantity >= 3 ? offer.threePlusLampDiscountFils : quantity === 2 ? offer.twoLampDiscountFils : 0
  );

  return {
    quantity,
    subtotalFils,
    eventDiscountFils,
    bundleDiscountFils,
    totalFils: afterEventDiscountFils - bundleDiscountFils,
  };
}
