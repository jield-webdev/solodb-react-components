export function scannedCodeIsLocationCode(url: string): boolean {
  const regex = /\/l\/\d+$/;
  return regex.test(url);
}

export function extractLabelNumber(url: string): number | null {
  const match = url.match(/\/l\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export const AMOUNT_UNITS = [
  { value: "g", label: "Gram" },
  { value: "kg", label: "Kilogram" },
  { value: "lb", label: "US pound" },
  { value: "mc", label: "Microgram" },
  { value: "mg", label: "Milligram" },
  { value: "oz", label: "Ounce" },
  { value: "to", label: "Tonnes" },
  { value: "ton", label: "US ton" },
  { value: '"3', label: "Cubic inch" },
  { value: "ccm", label: "Cubic centimeter" },
  { value: "cl", label: "Centiliter" },
  { value: "dm3", label: "Cubic decimeter" },
  { value: "foz", label: "Fluid Ounce Us" },
  { value: "ft3", label: "Cubic foot" },
  { value: "gal", label: "US gallon" },
  { value: "hl", label: "Hectoliter" },
  { value: "kit", label: "Kit" },
  { value: "l", label: "Liter" },
  { value: "m3", label: "Cubic meter" },
  { value: "ml", label: "Mililiter" },
  { value: "mm3", label: "Cubic milimeter" },
  { value: "pc", label: "Item" },
  { value: "pce", label: "Piece" },
  { value: "pt", label: "Pint, US liquid" },
  { value: "qt", label: "Quart, US liquid" },
  { value: "yd3", label: "Cubic Yard" },
  { value: "µl", label: "Microliter" },
].sort((a, b) => a.label.localeCompare(b.label));

export function getDefaultExpireDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 5);
  return date.toISOString().split("T")[0];
}
