import "server-only";
import { generateGeideaSessionSignature, formatGeideaTimestamp } from "./geidea-signature";
import { formatGeideaDiagnostic } from "./geidea-diagnostics";
import {
  verifyGeideaOrderResponse,
  type VerifiedGeideaCallback,
} from "./geidea-callback";

const UAE_API_BASE_URL = "https://api.geidea.ae";
const UAE_HPP_BASE_URL = "https://payments.geidea.ae";

function requiredEnv(primary: string, legacy?: string): string {
  const value = process.env[primary] ?? (legacy ? process.env[legacy] : undefined);
  if (!value) throw new Error(`${primary} is not configured.`);
  return value;
}

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getGeideaConfig() {
  const hppBaseUrl = withoutTrailingSlash(
    process.env.GEIDEA_HPP_BASE_URL ?? UAE_HPP_BASE_URL
  );
  return {
    merchantPublicKey: requiredEnv("GEIDEA_MERCHANT_PUBLIC_KEY", "GEIDEA_MERCHANT_ID"),
    apiPassword: requiredEnv("GEIDEA_API_PASSWORD"),
    apiBaseUrl: withoutTrailingSlash(process.env.GEIDEA_API_BASE_URL ?? UAE_API_BASE_URL),
    hppBaseUrl,
    sdkUrl: getGeideaSdkUrl(),
  };
}

export function getGeideaSdkUrl(): string {
  const hppBaseUrl = withoutTrailingSlash(
    process.env.GEIDEA_HPP_BASE_URL ?? UAE_HPP_BASE_URL
  );
  return process.env.GEIDEA_SDK_URL ?? `${hppBaseUrl}/hpp/geideaCheckout.min.js`;
}

type CreateCheckoutSessionInput = {
  amount: number;
  merchantReferenceId: string;
  callbackUrl: string;
  returnUrl: string;
  customer: {
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
  };
};

type GeideaSessionResponse = {
  session?: { id?: string; expiryDate?: string };
  responseCode?: string;
  responseMessage?: string;
  detailedResponseCode?: string;
  detailedResponseMessage?: string;
};

export type GeideaCheckoutSession = {
  sessionId: string;
  expiresAt: string;
  cardRedirectUrl: string;
};

export async function fetchVerifiedGeideaOrder(
  orderId: string
): Promise<VerifiedGeideaCallback> {
  const config = getGeideaConfig();
  const response = await fetch(
    `${config.apiBaseUrl}/pgw/api/v1/direct/order/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(
          `${config.merchantPublicKey}:${config.apiPassword}`
        ).toString("base64")}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    }
  );

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Geidea returned an unreadable order response (${response.status}).`);
  }
  if (!response.ok) throw new Error(`Geidea order lookup failed (${response.status}).`);

  return verifyGeideaOrderResponse(body, {
    merchantPublicKey: config.merchantPublicKey,
    orderId,
  });
}

export async function createGeideaCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<GeideaCheckoutSession> {
  const config = getGeideaConfig();
  const timestamp = formatGeideaTimestamp();
  const signature = generateGeideaSessionSignature({
    merchantPublicKey: config.merchantPublicKey,
    apiPassword: config.apiPassword,
    amount: input.amount,
    currency: "AED",
    merchantReferenceId: input.merchantReferenceId,
    timestamp,
  });

  const url = `${config.apiBaseUrl}/payment-intent/api/v2/direct/session`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(
      `${config.merchantPublicKey}:${config.apiPassword}`
    ).toString("base64")}`,
  };
  const requestBody = {
    amount: input.amount.toFixed(2),
    currency: "AED",
    timestamp,
    merchantReferenceId: input.merchantReferenceId,
    signature,
    callbackUrl: input.callbackUrl,
    returnUrl: input.returnUrl,
    paymentOperation: "Pay",
    language: "en",
    cardOnFile: false,
    customer: input.customer,
  };
  const logSessionCreation = process.env.GEIDEA_LOG_SESSION_CREATION === "true";
  const startedAt = Date.now();

  if (logSessionCreation) {
    console.info(
      "[Geidea session creation request]\n" +
        formatGeideaDiagnostic({
          requestedAt: new Date(startedAt).toISOString(),
          merchantPublicKey: config.merchantPublicKey,
          merchantReferenceId: input.merchantReferenceId,
          method: "POST",
          url,
          headers,
          body: requestBody,
        })
    );
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (logSessionCreation) {
      console.error(
        "[Geidea session creation transport error]\n" +
          formatGeideaDiagnostic({
            merchantReferenceId: input.merchantReferenceId,
            durationMs: Date.now() - startedAt,
            error:
              error instanceof Error
                ? { name: error.name, message: error.message }
                : String(error),
          })
      );
    }
    throw error;
  }

  let body: GeideaSessionResponse;
  const responseText = await response.text();
  try {
    body = JSON.parse(responseText) as GeideaSessionResponse;
  } catch {
    if (logSessionCreation) {
      console.info(
        "[Geidea session creation response]\n" +
          formatGeideaDiagnostic({
            receivedAt: new Date().toISOString(),
            merchantReferenceId: input.merchantReferenceId,
            durationMs: Date.now() - startedAt,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseText,
          })
      );
    }
    throw new Error(`Geidea returned an unreadable response (${response.status}).`);
  }

  if (logSessionCreation) {
    console.info(
      "[Geidea session creation response]\n" +
        formatGeideaDiagnostic({
          receivedAt: new Date().toISOString(),
          merchantReferenceId: input.merchantReferenceId,
          durationMs: Date.now() - startedAt,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body,
        })
    );
  }

  if (
    !response.ok ||
    body.responseCode !== "000" ||
    body.detailedResponseCode !== "000"
  ) {
    const message =
      body.detailedResponseMessage ?? body.responseMessage ?? `HTTP ${response.status}`;
    throw new Error(`Geidea session creation failed: ${message}`);
  }

  const sessionId = body.session?.id;
  const expiresAt = body.session?.expiryDate;
  if (!sessionId || !expiresAt || Number.isNaN(Date.parse(expiresAt))) {
    throw new Error("Geidea did not return a valid session ID and expiry date.");
  }

  return {
    sessionId,
    expiresAt,
    cardRedirectUrl: `${config.hppBaseUrl}/hpp/checkout/?${encodeURIComponent(sessionId)}`,
  };
}
