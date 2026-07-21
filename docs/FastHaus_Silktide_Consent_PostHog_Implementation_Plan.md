# FastHaus Silktide Consent and PostHog Implementation Plan

**Document purpose:** Implementation plan for Codex  
**Application:** FastHaus website  
**Framework:** Next.js App Router with TypeScript  
**Consent manager:** Silktide Consent Manager  
**Analytics platform:** PostHog  
**Google integration:** Google Consent Mode v2  
**Scope:** Essential, Analytics and Marketing consent categories

---

## 1. Objective

Replace the existing custom analytics consent banner and custom `localStorage` consent state with Silktide Consent Manager.

Silktide must become the single source of truth for cookie consent.

The existing analytics architecture should continue to work as follows:

- `AnalyticsProvider` controls PostHog initialization and tracking availability.
- Analytics components such as `CollectionViewed` send events through the shared analytics client.
- PostHog must not capture events or session recordings unless Analytics consent is granted.
- Google Consent Mode v2 signals must be updated by Silktide.
- Essential functionality, including the anonymous cart, must work regardless of optional cookie consent.
- No customer login or account functionality is required.

---

## 2. Existing Implementation

### 2.1 Current `AnalyticsProvider`

The current provider:

- Reads a custom consent value from `localStorage`.
- Uses `ANALYTICS_CONSENT_KEY`.
- Renders a custom analytics consent banner.
- Calls `posthog.opt_in_capturing()` when Analytics is accepted.
- Calls `posthog.opt_out_capturing()` and `posthog.reset()` when Analytics is declined.
- Tracks `$pageview` on Next.js route changes.
- Captures browser errors and unhandled promise rejections after Analytics consent.

Current file:

```text
AnalyticsProvider.tsx
```

### 2.2 Current `CollectionViewed`

The current component:

- Calls the shared `capture()` function.
- Fires once when `collection` or `productCount` changes.
- Does not directly interact with PostHog.
- Does not currently wait for Silktide consent restoration.

Current file:

```text
CollectionViewed.tsx
```

### 2.3 Main limitation

The existing consent state is separate from Silktide.

This can create two competing consent systems:

1. Silktide consent
2. FastHaus custom `localStorage` consent

The custom banner and custom consent key must be removed.

---

## 3. Target Architecture

```text
Visitor opens FastHaus
        |
        v
Silktide Consent Manager loads
        |
        v
Silktide restores saved consent or shows the banner
        |
        +-----------------------------+
        |                             |
        v                             v
Analytics granted               Analytics denied
        |                             |
        v                             v
AnalyticsProvider enables       AnalyticsProvider disables
PostHog capture                 PostHog capture
and session recording           and session recording
        |                             |
        v                             v
CollectionViewed and other      Analytics client silently
analytics components may        ignores event calls
send events
```

### Responsibilities

| Component | Responsibility |
|---|---|
| Silktide | Banner, preference modal, stored consent and Google Consent Mode signals |
| `AnalyticsProvider` | Read Silktide Analytics consent and control PostHog |
| Analytics client | Provide consent-safe `capture()` and `captureException()` functions |
| `CollectionViewed` | Describe the business event only |
| GTM or Google tag | Respect Silktide-generated Consent Mode signals |
| Anonymous cart | Remain strictly necessary and independent from Analytics consent |

---

## 4. Silktide Consent Categories

Configure three consent categories.

### 4.1 Essential Cookies

**Required:** Yes  
**Default:** Enabled  
**User toggle:** Locked

**Label**

```text
Essential cookies
```

**Description**

```text
These cookies are required for FastHaus to work correctly. They support essential features such as maintaining your shopping cart, processing checkout securely, remembering your cookie preferences and protecting the website from misuse. They cannot be disabled.
```

**Google Consent Mode signals**

```text
functionality_storage
security_storage
```

**Tracking and integrations**

```text
None
```

Do not add the anonymous cart implementation to Silktide's script-injection area. The cart is part of the website application and must work even when all optional cookies are rejected.

---

### 4.2 Analytics Cookies

**Required:** No  
**Default:** Disabled  
**User toggle:** Enabled

**Label**

```text
Analytics cookies
```

**Description**

```text
These cookies help us understand how visitors use FastHaus, which products and pages are most popular, and where we can improve the shopping experience. They may also support privacy-protected session replay and error monitoring.
```

**Google Consent Mode signal**

```text
analytics_storage
```

**Tracking and integrations**

Do not inject PostHog through Silktide when using the native Next.js PostHog SDK architecture described in this plan.

PostHog will remain installed in the application and will be controlled through:

```text
posthog.opt_in_capturing()
posthog.opt_out_capturing()
```

---

### 4.3 Marketing Cookies

**Required:** No  
**Default:** Disabled  
**User toggle:** Enabled

**Label**

```text
Marketing cookies
```

**Description**

```text
These cookies help us measure advertising performance, understand which campaigns lead to visits or purchases, and show more relevant advertising on other websites and platforms.
```

**Google Consent Mode signals**

```text
ad_storage
ad_user_data
ad_personalization
```

**Tracking and integrations**

Future marketing tools may include:

- Google Ads
- Meta Pixel
- LinkedIn Insight Tag
- TikTok Pixel

Do not add a provider in both Silktide and Google Tag Manager. Each integration must have one deployment method only.

---

## 5. Silktide Configuration Requirements

Codex must inspect the existing Silktide installation before changing it.

The implementation must support:

- The three consent categories defined above.
- `analytics_storage` mapped to Analytics.
- `ad_storage`, `ad_user_data` and `ad_personalization` mapped to Marketing.
- `functionality_storage` and `security_storage` mapped to Essential.
- The default Silktide consent update event:

```text
stcm_consent_update
```

Silktide pushes this event to `window.dataLayer`:

- When a visitor accepts or rejects from the initial prompt.
- When preferences are changed and saved.
- When a page loads with previously saved consent.

Silktide also automatically calls:

```js
gtag("consent", "update", { ... })
```

for categories that include Google Consent Mode mappings.

Do not manually duplicate the same Google consent updates elsewhere unless the existing architecture specifically requires it.

---

## 6. Required Code Changes

### 6.1 Remove the custom banner

Remove the custom `<aside>` banner from `AnalyticsProvider.tsx`.

Delete the following behaviour:

```tsx
{consent === null && (
  <aside>
    ...
  </aside>
)}
```

Silktide will render the cookie banner and preferences interface.

---

### 6.2 Remove the custom consent key

Remove the dependency on:

```ts
ANALYTICS_CONSENT_KEY
```

Remove:

```ts
localStorage.getItem(ANALYTICS_CONSENT_KEY)
```

Remove:

```ts
localStorage.setItem(ANALYTICS_CONSENT_KEY, next)
```

Silktide must own consent persistence.

Do not create a second FastHaus-specific consent cookie or local-storage item.

---

### 6.3 Add a consent state type

Use a three-state model:

```ts
export type AnalyticsConsentState =
  | "unknown"
  | "granted"
  | "denied";
```

Meaning:

- `unknown`: Silktide has not finished loading or restoring consent.
- `granted`: Analytics consent is accepted.
- `denied`: Analytics consent is rejected.

Do not treat `unknown` as granted.

---

### 6.4 Add Silktide TypeScript declarations

Create:

```text
src/types/silktide.d.ts
```

The declarations must match the actual Silktide API available in the installed version.

Expected shape:

```ts
export {};

type SilktideConsentManagerInstance = {
  getConsentChoice: (id: string) => boolean | null;
  getAcceptedConsents?: () => Record<string, boolean>;
};

type SilktideConsentManager = {
  getInstance: () => SilktideConsentManagerInstance | null;
  resetConsent?: () => void;
};

declare global {
  interface Window {
    silktideConsentManager?: SilktideConsentManager;
    dataLayer?: Array<Record<string, unknown>>;
  }
}
```

Before finalizing this file, Codex must inspect the installed Silktide implementation or generated configuration and confirm the exact runtime API.

---

### 6.5 Create an Analytics consent context

Create:

```text
src/providers/AnalyticsConsentContext.tsx
```

Suggested interface:

```tsx
"use client";

import { createContext, useContext } from "react";

export type AnalyticsConsentState =
  | "unknown"
  | "granted"
  | "denied";

const AnalyticsConsentContext =
  createContext<AnalyticsConsentState>("unknown");

export function useAnalyticsConsent(): AnalyticsConsentState {
  return useContext(AnalyticsConsentContext);
}

export { AnalyticsConsentContext };
```

The context allows event components to wait until Silktide has restored consent.

---

### 6.6 Refactor `AnalyticsProvider`

Refactor the existing provider so it:

1. Removes the custom banner.
2. Removes direct consent storage.
3. Reads the current Analytics choice from Silktide.
4. Listens for consent updates.
5. Enables or disables PostHog.
6. Exposes consent through `AnalyticsConsentContext`.
7. Continues route-based page-view tracking.
8. Continues error tracking only when Analytics is granted.

Suggested structure:

```tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  usePathname,
  useSearchParams
} from "next/navigation";
import posthog from "posthog-js";

import {
  captureException,
  setAnalyticsConsent
} from "@/lib/analytics/client";
import {
  AnalyticsConsentContext,
  type AnalyticsConsentState
} from "@/providers/AnalyticsConsentContext";

function readSilktideAnalyticsConsent(): AnalyticsConsentState {
  const manager =
    window.silktideConsentManager?.getInstance();

  if (!manager) {
    return "unknown";
  }

  const choice =
    manager.getConsentChoice("analytics");

  if (choice === true) {
    return "granted";
  }

  if (choice === false) {
    return "denied";
  }

  return "unknown";
}

export default function AnalyticsProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [consent, setConsent] =
    useState<AnalyticsConsentState>("unknown");

  const previousConsent =
    useRef<AnalyticsConsentState>("unknown");

  const applyConsent = useCallback(
    (nextConsent: AnalyticsConsentState) => {
      if (previousConsent.current === nextConsent) {
        return;
      }

      previousConsent.current = nextConsent;
      setConsent(nextConsent);

      const granted = nextConsent === "granted";
      setAnalyticsConsent(granted);

      if (nextConsent === "granted") {
        posthog.opt_in_capturing();
        posthog.startSessionRecording();
        return;
      }

      if (nextConsent === "denied") {
        posthog.stopSessionRecording();
        posthog.opt_out_capturing();
        posthog.reset();
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maximumAttempts = 50;

    function restoreConsent() {
      if (cancelled) {
        return;
      }

      const nextConsent =
        readSilktideAnalyticsConsent();

      if (
        nextConsent !== "unknown" ||
        attempts >= maximumAttempts
      ) {
        applyConsent(nextConsent);
        return;
      }

      attempts += 1;
      window.setTimeout(restoreConsent, 100);
    }

    restoreConsent();

    return () => {
      cancelled = true;
    };
  }, [applyConsent]);

  useEffect(() => {
    function onConsentUpdate() {
      applyConsent(
        readSilktideAnalyticsConsent()
      );
    }

    window.addEventListener(
      "stcm_consent_update",
      onConsentUpdate
    );

    return () => {
      window.removeEventListener(
        "stcm_consent_update",
        onConsentUpdate
      );
    };
  }, [applyConsent]);

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    posthog.capture("$pageview", {
      $current_url: window.location.href
    });
  }, [pathname, searchParams, consent]);

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    const onError = (event: ErrorEvent) => {
      captureException(
        event.error ?? event.message,
        { source: "window_error" }
      );
    };

    const onRejection = (
      event: PromiseRejectionEvent
    ) => {
      captureException(event.reason, {
        source: "unhandled_rejection"
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener(
      "unhandledrejection",
      onRejection
    );

    return () => {
      window.removeEventListener(
        "error",
        onError
      );
      window.removeEventListener(
        "unhandledrejection",
        onRejection
      );
    };
  }, [consent]);

  return (
    <AnalyticsConsentContext.Provider
      value={consent}
    >
      {children}
    </AnalyticsConsentContext.Provider>
  );
}
```

### Important event-listener note

Silktide documents `stcm_consent_update` as a `dataLayer` event.

Codex must inspect whether the installed Silktide version also dispatches it as a browser `CustomEvent`.

If it does not, use one of these supported approaches:

#### Preferred approach

Use Silktide category callbacks such as `onAccept` and `onReject` to dispatch a FastHaus browser event:

```js
window.dispatchEvent(
  new CustomEvent("fasthaus:consent-change")
);
```

Then listen for:

```text
fasthaus:consent-change
```

#### Alternative approach

Subscribe through the existing GTM/dataLayer integration, provided the implementation is reliable and does not monkey-patch `dataLayer.push` unsafely.

Do not assume that a `dataLayer` event is automatically a browser event.

---

### 6.7 Update the analytics client

Inspect:

```text
src/lib/analytics/client.ts
```

Add or preserve a module-level consent gate:

```ts
let analyticsConsentGranted = false;

export function setAnalyticsConsent(
  granted: boolean
): void {
  analyticsConsentGranted = granted;
}
```

Update every analytics method so it exits before calling PostHog when consent is absent:

```ts
export function capture(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!analyticsConsentGranted) {
    return;
  }

  posthog.capture(event, properties);
}
```

Apply the same guard to:

- `captureException()`
- user identification methods
- session replay helper methods
- feature-specific analytics helpers
- any future analytics provider calls

Do not rely only on React components to check consent. The shared client must enforce it centrally.

---

### 6.8 Confirm PostHog initialization settings

Locate the existing `posthog.init()` call.

Ensure it includes:

```ts
posthog.init(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    opt_out_capturing_by_default: true
  }
);
```

Requirements:

- `capture_pageview` must be `false` because `AnalyticsProvider` captures route-based page views.
- PostHog must start opted out.
- Session recording must not begin before consent.
- Input fields and sensitive content must remain masked.
- Contact, address, payment and free-text form data must not be captured.

Codex must preserve any existing privacy options that are stricter than this plan.

---

## 7. Update `CollectionViewed`

The existing component calls the correct shared analytics abstraction, but it may fire before Silktide restores a saved consent choice.

Refactor it to wait for granted consent.

Suggested implementation:

```tsx
"use client";

import {
  useEffect,
  useRef
} from "react";

import {
  capture
} from "@/lib/analytics/client";
import {
  analyticsEvents
} from "@/lib/analytics/events";
import {
  useAnalyticsConsent
} from "@/providers/AnalyticsConsentContext";

export default function CollectionViewed({
  collection,
  productCount
}: {
  collection: string;
  productCount: number;
}) {
  const consent = useAnalyticsConsent();
  const capturedKey =
    useRef<string | null>(null);

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    const eventKey =
      `${collection}:${productCount}`;

    if (capturedKey.current === eventKey) {
      return;
    }

    capture(
      analyticsEvents.collectionViewed,
      {
        collection,
        product_count: productCount
      }
    );

    capturedKey.current = eventKey;
  }, [
    collection,
    productCount,
    consent
  ]);

  return null;
}
```

This must result in:

- No event while consent is unknown.
- No event while consent is denied.
- One event after previously saved granted consent is restored.
- One event if the visitor accepts Analytics while still on the page.
- No duplicate event caused by rerenders.
- A new event when the collection genuinely changes.

### Event identity improvement

If available, use a stable collection ID or slug rather than the display name alone.

Suggested properties:

```ts
{
  collection_id: collectionId,
  collection_slug: collectionSlug,
  collection_name: collectionName,
  product_count: productCount
}
```

Do not add this change if the required values are unavailable without wider refactoring.

---

## 8. Page-View Behaviour

The current provider tracks page views on:

```ts
pathname
searchParams
consent
```

Preserve route-based tracking.

The implementation must avoid duplicates caused by:

- PostHog automatic page-view capture.
- A page view manually fired inside the old `choose()` function.
- The route tracking effect firing at the same time as consent restoration.

Recommended behaviour:

- Set `capture_pageview: false` in PostHog initialization.
- Remove the old `choose()` function entirely.
- Use only the provider route effect for `$pageview`.
- When consent changes from denied or unknown to granted, the current page should be captured once.

Codex must add a deduplication guard if development testing shows duplicate initial page views.

---

## 9. Consent Withdrawal Behaviour

When a visitor changes Analytics from granted to denied:

1. Stop PostHog session recording.
2. Opt out of capturing.
3. Reset the active PostHog identity.
4. Prevent all future calls through the shared analytics client.
5. Do not affect the anonymous shopping cart.
6. Do not remove essential cart or checkout cookies.
7. Follow Silktide's normal page reload behaviour if configured for script removal.

Expected calls:

```ts
posthog.stopSessionRecording();
posthog.opt_out_capturing();
posthog.reset();
setAnalyticsConsent(false);
```

---

## 10. Google Consent Mode and GTM

### Analytics category

Map:

```text
analytics_storage
```

### Marketing category

Map:

```text
ad_storage
ad_user_data
ad_personalization
```

### Essential category

Map:

```text
functionality_storage
security_storage
```

If Google Tag Manager is used:

1. Create a Custom Event trigger.
2. Event name:

```text
stcm_consent_update
```

3. Apply additional consent requirements to relevant tags.
4. Analytics tags should require:

```text
analytics_storage
```

5. Advertising tags should require the relevant advertising consent signals.
6. Avoid loading the same tag both through Silktide and GTM.

Google tags may use Consent Mode's consent-aware behaviour. Non-Google tools still require explicit script or SDK control.

---

## 11. Suggested File Changes

Codex should inspect the actual repository and adapt paths to the existing structure.

Expected files:

```text
src/
  app/
    layout.tsx
  providers/
    AnalyticsProvider.tsx
    AnalyticsConsentContext.tsx
  components/
    analytics/
      CollectionViewed.tsx
  lib/
    analytics/
      client.ts
      events.ts
      posthog.ts
  types/
    silktide.d.ts
```

Possible additional files:

```text
public/
  silktide-consent-manager.js

src/
  lib/
    consent/
      silktide.ts
```

Do not duplicate existing modules unnecessarily.

---

## 12. Implementation Sequence

### Phase 1: Inspect

Codex must first inspect:

- Current Silktide installation and configuration.
- Current `posthog.init()` location.
- `src/lib/analytics/client.ts`.
- `src/lib/analytics/events.ts`.
- Root `layout.tsx`.
- Current GTM or Google tag setup.
- Any existing consent types or helper functions.
- Whether `stcm_consent_update` is available as a browser event or only a `dataLayer` event.

### Phase 2: Configure Silktide

- Add or update Essential, Analytics and Marketing categories.
- Add category descriptions.
- Add Google Consent Mode mappings.
- Keep Analytics and Marketing disabled by default.
- Keep Essential required.
- Preserve FastHaus visual styling.

### Phase 3: Refactor consent handling

- Remove custom banner.
- Remove `ANALYTICS_CONSENT_KEY`.
- Add Silktide type declarations.
- Add consent context.
- Refactor `AnalyticsProvider`.
- Add reliable consent update subscription.

### Phase 4: Harden analytics client

- Add a central consent gate.
- Confirm PostHog starts opted out.
- Disable automatic page-view capture.
- Confirm session recording starts only after consent.
- Preserve masking and privacy settings.

### Phase 5: Update collection tracking

- Make `CollectionViewed` consent-aware.
- Add duplicate prevention.
- Preserve the existing analytics event name and properties unless there is a documented reason to migrate them.

### Phase 6: Test

- Run type checking.
- Run linting.
- Run unit and integration tests.
- Test manually in a clean browser profile.
- Verify PostHog and Google consent behaviour in browser developer tools.

---

## 13. Testing Scenarios

### 13.1 First visit, no choice

Expected:

- Silktide banner is shown.
- Essential cart functionality works.
- PostHog does not capture.
- Session recording does not start.
- `CollectionViewed` is not sent.
- Analytics and advertising consent signals remain denied.

### 13.2 Accept Analytics only

Expected:

- PostHog opts in.
- Session recording starts with masking.
- Current page view is sent once.
- `CollectionViewed` is sent once.
- `analytics_storage` becomes granted.
- Marketing signals remain denied.

### 13.3 Reject non-essential cookies

Expected:

- PostHog remains opted out.
- Session recording remains stopped.
- No collection or page-view analytics events are sent.
- Anonymous cart remains functional.
- Analytics and Marketing signals remain denied.

### 13.4 Accept all

Expected:

- Analytics tracking is enabled.
- Marketing consent signals are granted.
- No duplicate PostHog initialization occurs.
- Current page view and collection view are not duplicated.

### 13.5 Saved Analytics consent

Expected after page reload:

- Silktide restores consent.
- PostHog is enabled after restoration.
- Current page view is sent once.
- `CollectionViewed` is sent once.
- Banner is not shown again unnecessarily.

### 13.6 Withdraw Analytics consent

Expected:

- Session recording stops.
- PostHog opts out.
- Identity is reset.
- Future events are blocked.
- Anonymous cart contents remain available.
- Essential cookies remain untouched.

### 13.7 Next.js route navigation

Expected:

- Each genuine route change sends one `$pageview`.
- Query-string changes are tracked only if that is the intended existing behaviour.
- No page view is sent without Analytics consent.

### 13.8 React development mode

Expected:

- Strict Mode effect re-execution does not create duplicate `collectionViewed` events.
- Strict Mode does not create duplicate page views.
- Consent initialization is idempotent.

---

## 14. Developer Verification Checklist

Use browser developer tools to verify:

### Application storage

- Silktide consent storage is present.
- The old `ANALYTICS_CONSENT_KEY` is no longer written.
- PostHog cookies are not created before Analytics consent.
- The essential anonymous cart cookie remains available after rejecting Analytics.

### Network

Before consent:

- No PostHog event requests.
- No session replay requests.
- No unwanted marketing requests.

After Analytics consent:

- PostHog event requests begin.
- Page view and collection events contain expected properties.
- No duplicate requests.

After consent withdrawal:

- New PostHog event requests stop.

### Console

- No hydration errors.
- No missing `window.silktideConsentManager` errors.
- No TypeScript-driven runtime assumptions about APIs that do not exist.
- No duplicate PostHog initialization warning.

### Google Tag Assistant

- Default consent is denied where required.
- `analytics_storage` changes when Analytics is accepted.
- Advertising signals change only when Marketing is accepted.
- Consent updates occur before relevant tags fire.

---

## 15. Acceptance Criteria

The implementation is complete when all criteria below are met.

- [ ] Silktide is the only cookie consent interface.
- [ ] The custom FastHaus analytics banner has been removed.
- [ ] `ANALYTICS_CONSENT_KEY` is no longer used.
- [ ] Essential, Analytics and Marketing categories are configured.
- [ ] Essential cookies are always active.
- [ ] Analytics and Marketing are disabled by default.
- [ ] Google Consent Mode v2 signals are correctly mapped.
- [ ] PostHog starts opted out.
- [ ] PostHog starts capturing only after Analytics consent.
- [ ] Session recording starts only after Analytics consent.
- [ ] Session recording stops when consent is withdrawn.
- [ ] Analytics calls are centrally blocked without consent.
- [ ] `CollectionViewed` waits for granted consent.
- [ ] `CollectionViewed` does not fire twice during rerenders or Strict Mode.
- [ ] Route page views are captured once per intended route change.
- [ ] Anonymous cart functionality works after rejecting optional cookies.
- [ ] No essential cart cookie is controlled by the Analytics toggle.
- [ ] No analytics or marketing script is deployed twice.
- [ ] Type checking and linting pass.
- [ ] Relevant automated tests pass.
- [ ] Manual consent scenarios have been verified.

---

## 16. Codex Execution Prompt

```text
Implement Silktide-based consent control for the FastHaus analytics architecture.

Start by inspecting the existing repository, especially:

- AnalyticsProvider.tsx
- CollectionViewed.tsx
- src/lib/analytics/client.ts
- src/lib/analytics/events.ts
- the PostHog initialization file
- app/layout.tsx
- the current Silktide configuration
- Google Tag Manager or Google tag setup

Requirements:

1. Make Silktide the only source of truth for cookie consent.
2. Remove the custom AnalyticsProvider cookie banner.
3. Remove ANALYTICS_CONSENT_KEY and all custom localStorage consent handling.
4. Configure Essential, Analytics and Marketing consent categories.
5. Map Google Consent Mode signals as follows:
   - Essential: functionality_storage, security_storage
   - Analytics: analytics_storage
   - Marketing: ad_storage, ad_user_data, ad_personalization
6. Keep the anonymous cart strictly necessary and independent from optional consent.
7. Add a typed Analytics consent context with unknown, granted and denied states.
8. Refactor AnalyticsProvider to:
   - restore saved Analytics consent from Silktide
   - react to consent changes
   - call posthog.opt_in_capturing() only after consent
   - start session recording only after consent
   - stop recording, opt out and reset when consent is withdrawn
   - preserve route-based page-view and error tracking
9. Confirm whether stcm_consent_update is only a dataLayer event or also a browser event in the installed Silktide version. Use a reliable callback or custom browser event if required.
10. Add a central consent gate to every analytics client method.
11. Ensure PostHog is initialized with:
    - opt_out_capturing_by_default: true
    - capture_pageview: false
12. Update CollectionViewed so it:
    - waits for Analytics consent
    - captures after saved consent is restored
    - captures if the user accepts while still on the page
    - prevents duplicate events
13. Preserve existing privacy masking for inputs, address, contact, payment and free-text data.
14. Do not inject PostHog through Silktide if the native PostHog SDK remains installed in Next.js.
15. Do not deploy any provider both through GTM and Silktide.
16. Add or update tests for all acceptance criteria.

Before writing code, identify any mismatch between this plan and the actual Silktide or PostHog versions installed in the repository. Use the installed APIs as the source of truth.

After implementation, report:

- files changed
- architecture decisions
- consent event mechanism used
- tests run and results
- manual verification steps
- unresolved assumptions or blockers
```

---

## 17. Reference Documentation

Use current official documentation during implementation:

- Silktide Consent Manager, Google Consent Mode:
  `https://silktide.com/consent-manager/docs/google-consent-mode/`

- Silktide advanced configuration:
  `https://silktide.com/consent-manager/docs/configuration-options-advanced/`

- Silktide installation generator:
  `https://silktide.com/consent-manager/install/`

- PostHog JavaScript documentation:
  `https://posthog.com/docs/libraries/js`

- PostHog Next.js documentation:
  `https://posthog.com/docs/libraries/next-js`

---

## 18. Implementation Notes

This plan intentionally keeps application event components such as `CollectionViewed` independent from Silktide's internal storage.

Components should only know:

```text
Is Analytics consent granted?
```

They should not know:

- How Silktide stores consent.
- Which cookies Silktide uses.
- How Google Consent Mode is updated.
- How PostHog is initialized.
- Which future analytics provider may replace PostHog.

This separation makes the implementation easier to maintain and safer to extend.
