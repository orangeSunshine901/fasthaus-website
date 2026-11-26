const launchOffer = { code: "WHITEFRIDAY20", percent: 20 } as const;
const closingOffer = { code: "WHITEFRIDAY25", percent: 25 } as const;
type Schedule = [start: number, switchAt: number | null, end: number | null];
type LiveSchedule = {
  starts_at: string;
  switches_at: string | null;
  ends_at: string | null;
  server_time: string;
};

export function whiteFridayOfferAt(now: number, schedule: Schedule | null) {
  if (!schedule) return null;
  const [start, switchAt, end] = schedule;
  if (now < start || (end !== null && now >= end)) return null;
  return switchAt === null || now < switchAt ? launchOffer : closingOffer;
}

export function isWhiteFridayCode(code: string) {
  return code === launchOffer.code || code === closingOffer.code;
}

let confirmedSchedule: Schedule | null | undefined;
let serverClockOffset = 0;

function browserTime() {
  return performance.now() + serverClockOffset;
}

export function currentWhiteFridayOffer() {
  return confirmedSchedule === undefined ? undefined : whiteFridayOfferAt(browserTime(), confirmedSchedule);
}

export function subscribeToWhiteFridayOffer(onChange: () => void) {
  let timer: number | undefined;
  let refreshing = false;
  const controller = new AbortController();
  function scheduleNextChange() {
    window.clearTimeout(timer);
    onChange();
    const now = browserTime();
    const next = confirmedSchedule?.find((timestamp) => timestamp !== null && timestamp > now);
    if (next != null) {
      timer = window.setTimeout(scheduleNextChange, Math.min(next - now, 2_147_483_647));
    }
  }

  async function refreshSchedule() {
    if (refreshing || document.visibilityState !== "visible") return;
    refreshing = true;
    const startedAt = performance.now();
    try {
      const response = await fetch("/api/white-friday", { cache: "no-store", signal: controller.signal });
      if (!response.ok) return;
      const data: LiveSchedule | null = await response.json();
      if (controller.signal.aborted) return;
      confirmedSchedule = data ? [
        Date.parse(data.starts_at),
        data.switches_at ? Date.parse(data.switches_at) : null,
        data.ends_at ? Date.parse(data.ends_at) : null,
      ] : null;
      if (data) serverClockOffset = Date.parse(data.server_time) - (startedAt + performance.now()) / 2;
      scheduleNextChange();
    } catch {
      // Keep using the last confirmed schedule while the request is unavailable.
    } finally {
      refreshing = false;
    }
  }

  function wakeUp() {
    scheduleNextChange();
    void refreshSchedule();
  }
  wakeUp();
  const refreshTimer = window.setInterval(refreshSchedule, 30_000);
  window.addEventListener("pageshow", wakeUp);
  document.addEventListener("visibilitychange", wakeUp);
  return () => {
    controller.abort();
    window.clearTimeout(timer);
    window.clearInterval(refreshTimer);
    window.removeEventListener("pageshow", wakeUp);
    document.removeEventListener("visibilitychange", wakeUp);
  };
}

export function initialWhiteFridayOffer() {
  return undefined;
}
