export const AFTER_HOURS_DELAY_MS = 120_000;
export const AFTER_HOURS_SESSION_KEY = "fasthaus_after_hours_seen";
export const AFTER_HOURS_TIME_KEY = "fasthaus_after_hours_active_ms";

export function isAfterHoursInvitationRoute(pathname: string) {
  return ["/", "/about", "/faq"].includes(pathname)
    || /^\/(collection|product)(\/[^/]+)?\/?$/.test(pathname);
}
