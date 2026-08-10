function localDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00971")) digits = digits.slice(5);
  else if (digits.startsWith("971")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

export function formatPhoneInput(raw: string): string {
  const digits = localDigits(raw);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)].filter(Boolean).join(" ");
}
