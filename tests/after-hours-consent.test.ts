import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

test("the standalone game sends nothing before consent, never replays it, and stops on withdrawal", async () => {
  const result = await build({
    entryPoints: ["lib/analytics/after-hours-browser.ts"], bundle: true, write: false, format: "iife",
    define: {
      "process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN": JSON.stringify("test-public-token"),
      "process.env.NEXT_PUBLIC_POSTHOG_HOST": JSON.stringify("https://example.invalid"),
      "process.env.NODE_ENV": JSON.stringify("test"),
    },
    plugins: [{ name: "fake-sdk", setup(builder) {
      builder.onResolve({ filter: /^posthog-js$/ }, () => ({ path: "sdk", namespace: "test" }));
      builder.onLoad({ filter: /.*/, namespace: "test" }, () => ({ contents: "export default globalThis.fakeSDK" }));
    } }],
  });
  let choice: boolean | null = null;
  const calls: { method: string; event?: string }[] = [];
  const window = Object.assign(new EventTarget(), {
    location: { href: "https://example.invalid/after-hours" },
    silktideConsentManager: { init() {}, getInstance: () => ({ getConsentChoice: () => choice }) },
  });
  const document = Object.assign(new EventTarget(), {
    documentElement: { lang: "en" }, getElementById: () => null,
  });
  const fakeSDK = Object.fromEntries(["init", "opt_in_capturing", "startSessionRecording", "stopSessionRecording", "opt_out_capturing", "reset", "captureException"].map((method) => [method, () => calls.push({ method })]));
  fakeSDK.capture = ((event: string) => calls.push({ method: "capture", event })) as () => number;
  vm.runInNewContext(result.outputFiles[0].text, { window, document, fakeSDK, CustomEvent, URLSearchParams, location: { search: "" }, console });
  const action = (event: string) => document.dispatchEvent(new CustomEvent("fasthaus:analytics", { detail: { event, properties: {} } }));
  action("after_hours_entered");
  assert.equal(calls.length, 0, "unknown consent must not initialize or capture");
  choice = false; window.dispatchEvent(new Event("fasthaus:consent-change")); action("after_hours_started");
  assert.equal(calls.length, 0, "declined consent must not initialize or capture");
  choice = true; window.dispatchEvent(new Event("fasthaus:consent-change"));
  action("after_hours_completed"); action("unapproved_event");
  assert.deepEqual(calls.filter((call) => call.method === "capture").map((call) => call.event), ["$pageview", "after_hours_viewed", "after_hours_completed"]);
  const captured = calls.filter((call) => call.method === "capture").length;
  choice = false; window.dispatchEvent(new Event("fasthaus:consent-change")); action("after_hours_shop_clicked");
  assert.equal(calls.filter((call) => call.method === "capture").length, captured);
  assert.ok(calls.some((call) => call.method === "stopSessionRecording"));
  assert.ok(calls.some((call) => call.method === "opt_out_capturing"));
});
