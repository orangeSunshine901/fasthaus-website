import { PostHog } from "posthog-node";
import type { AnalyticsEvent, AnalyticsProperties } from "./events";

export async function captureServerEvent(
  distinctId: string,
  event: AnalyticsEvent,
  properties: AnalyticsProperties,
) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) return;

  const client = new PostHog(token, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  client.capture({ distinctId, event, properties });
  await client.shutdown();
}
