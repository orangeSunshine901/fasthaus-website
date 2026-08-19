const REDACTED_FIELDS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "apipassword",
  "password",
  "tokenid",
  "cardnumber",
  "pan",
  "cvv",
  "cvc",
  "securitycode",
  "email",
  "phonenumber",
  "phone",
  "firstname",
  "lastname",
  "street",
  "postalcode",
  "postcode",
]);

export function formatGeideaDiagnostic(value: unknown): string {
  return JSON.stringify(
    value,
    (key, fieldValue) =>
      REDACTED_FIELDS.has(key.toLowerCase()) ? "[REDACTED]" : fieldValue,
    2
  );
}
