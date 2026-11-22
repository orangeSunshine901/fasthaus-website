# After Hours

After Hours is the public Fasthaus lamp story game. It extends the current storefront and its Post-Digital Bauhaus direction; it does not establish a new visual system.

## Routes and entry points

- `/after-hours` rewrites to `public/game-test/index.html`. Keep the static folder and `<base href="/game-test/">` together so existing scripts, styles, fonts and sprites resolve correctly.
- `/game-test` and `/game-test/index.html` permanently redirect to `/after-hours` with HTTP 308. Canonical and social metadata use `/after-hours`; the sitemap includes the public URL.
- The homepage section follows the product, process and studio content, before the optional newsletter. Its button and actual-game preview both open `/after-hours`.
- The footer's Studio column links to After Hours. The game links back to `/collection` and to the real lamp product pages on completion.

## Game and visual continuity

English and Arabic language selection, RTL text, authored lamp sprites, keeper portraits, story typing, full-text skip, hints, wrong-answer retries, discovery lighting, sound controls, reduced-motion behavior and replay remain available. Three discoveries complete a game drawn from four lamps. Completion offers product discovery and collection links. The inactive demo coupon and discount promises were removed by the user's choice; gameplay does not award a discount.

The surrounding interface uses current Satoshi typography, ivory (`#f8f6f3`), near-black (`#141114`), Fasthaus orange (`#ff4b1f`) and restrained rounded frames. Pixelify dialogue and the existing Arabic font remain local to the game. The dark studio, warm lamp light, pixel artwork and editorial spacing are this surface's expression of the established direction, not new global tokens.

`public/after-hours-studio.png` is an unmodified export of the existing game canvas after three discoveries, captured through actual gameplay on 2026-11-16. It supplies the homepage preview, mobile opening artwork and social preview. Existing assets remain in `public/game-test/assets/`; no generated illustration, stock image or new font was introduced.

The incumbent `design.md` predates the current Satoshi implementation: it specifies DM Sans, larger small-screen body tokens and different heading weights/line heights. `app/globals.css` is the current implementation evidence. This pre-existing drift is recorded here without refreshing or replacing the design specification or creating a token sidecar.

## Timed invitation

`AfterHoursInvitation` mounts in the shared layout. Its nonmodal invitation appears after `120000ms` of eligible active browsing, once per tab session. It does not move focus or trap keyboard navigation. The close button remains visible; Escape dismisses when keyboard focus is inside the invitation.

Eligible routes are `/`, `/about`, `/faq`, `/collection`, `/collection/:category`, `/product` and `/product/:slug`. Other routes are excluded, including cart, checkout, orders, admin, contact, the game and API routes. Timing pauses while the page is hidden, the page is scroll-locked, the homepage reveal is locked, the cart drawer is open, consent UI is visible, or the returning-visitor/complimentary-gift offer is visible. The shared page lock covers the navigation menu. A blocker also hides an already visible invitation; its seen state prevents another display that session.

Session storage holds two essential interface-state values:

- `fasthaus_after_hours_active_ms`: accumulated eligible time, retained across navigation and reloads in that tab.
- `fasthaus_after_hours_seen`: `1` when shown or when the game is entered, suppressing further invitations that tab session.

If storage is unavailable, the component retains timing and seen state in memory. Browsing still works, but that fallback cannot preserve the state across a full reload. The game separately retains the existing language preference in `fasthaus:game-language` when local storage is available. These are interface preferences, not new analytics collection.

## Existing integration contract

The game continues dispatching document events `fasthaus:start`, `fasthaus:discovery`, `fasthaus:hint`, `fasthaus:complete` and `fasthaus:restart`. Existing detail fields and `prototype: true` remain to avoid breaking integrations. The public route does not change that legacy payload flag. The original document events remain available alongside the analytics integration described below.

## Validation

Run from the app root:

```sh
npm test
npx tsc --noEmit
npx eslint components/home/AfterHoursSection.tsx components/home/AfterHoursInvitation.tsx lib/after-hours.ts tests/after-hours.test.ts
npx next build --webpack
npm run start
```

With the local app running, use a separate terminal:

```sh
node scripts/check-after-hours.mjs
```

The browser check defaults to `http://localhost:3000`; set `AFTER_HOURS_TEST_URL` to use another running instance. It uses installed Chrome through Playwright and writes review screenshots to `.impeccable/review/after-hours/`.

The completed local verification passed at widths 1440, 390, 320 and 834px: English/Arabic full gameplay, wrong answers, all hints, keyboard activation, completion images and product links, sound toggle state, replay, language switch and horizontal overflow checks. Invitation checks passed for consent blocking, two-minute timing, time across pages, dismissal across reloads, homepage entry, collection return and the legacy 308 redirect. Route exclusions and public reward/metadata contracts have unit coverage. The full test run reported 81 passes and one database-dependent skip; TypeScript, targeted ESLint and the production webpack build passed.

The local shared `node_modules` symlink was incompatible with Turbopack, so production validation used `next build --webpack`. Physical phones/tablets, other browser engines and audible browser audio were not tested. Sound-toggle assertions verify control state, not heard output. Local checks do not establish production deployment.

## Gameplay metrics and feedback (22 November 2026)

The static game now loads `analytics.js` asynchronously. `scripts/build-after-hours-analytics.mjs` bundles the existing PostHog SDK with the same configuration used by the storefront. Both `npm run dev` and `npm run build` generate this ignored public bundle. Direct `next` commands must run that script first. Public PostHog configuration comes from the existing environment variables; no private token is exposed.

Silktide is initialized with the shared consent configuration. No PostHog client is initialized before Analytics consent, and pre-consent actions are not queued. Withdrawal stops replay and capture. Feedback links remain usable independently of optional analytics. The footer provides a cookie-preferences control.

### Event definitions

- `after_hours_viewed`: game page seen after Analytics consent.
- `after_hours_entered`: Start game clicked; the introductory conversation begins.
- `after_hours_started`: first guessing round reached after the introduction.
- `after_hours_round_started`: each of the three guessing rounds begins.
- `after_hours_guess_submitted`: each valid guess, with selected and target lamp, correctness and attempt count.
- `after_hours_lamp_discovered`: a correct guess lights a lamp.
- `after_hours_hint_used`: each successfully revealed hint, with its target lamp.
- `after_hours_completed`: the completion panel opens after all three discoveries.
- `after_hours_restarted`: start-over/replay, preserving whether the previous run completed.
- `after_hours_shop_clicked`: collection or product link clicked from the game.
- `after_hours_feedback_opened`: completion or footer feedback link clicked.
- `after_hours_language_selected`: language chosen or switched.
- `after_hours_exited`: page actually leaves after entry; hiding a tab does not count as abandonment.
- `after_hours_invitation_shown`, `after_hours_invitation_clicked`, `after_hours_invitation_dismissed`: timed storefront invitation interactions, also gated by Analytics consent.

Each run has a fresh in-memory `game_id`. `game_version`, `language`, current phase/round, found lamps, attempts, wrong guesses, total hints and visible `active_seconds` provide analysis context. Active time starts on entry, pauses while hidden and stops at completion. No feedback free text or contact details enter gameplay properties. `entry=home` and `entry=invitation` distinguish those entry points without new analytics storage.

### Feedback collection

`/after-hours/feedback?lang=en` and `?lang=ar` redirect to the matching live hosted PostHog form. The in-game link follows the selected game language. An optional prompt appears below the completion product links, and a footer link is always available so players who encounter problems can respond before finishing. The game stays open in its original tab.

The form asks for a 1–5 enjoyment rating, optional clue difficulty/technical-problem choice, and an optional suggestion (2,000 character limit). Partial responses are enabled. It requests no name, email or payment information, and no visitor distinct ID is passed to the form. Hosted responses are anonymous and cannot be directly joined to a particular game run.

English form: https://eu.posthogsurveys.com/external_surveys/01a20233-f15e-0000-bed3-c13124505fd2

Arabic form: https://eu.posthogsurveys.com/external_surveys/01a20253-2fd4-0000-e45c-68964545354d

### Review loop

Dashboard: https://eu.posthog.com/project/199109/dashboard/1139721

The seven charts cover plays and unique players, the player journey, clue friction by lamp, median active completion time, collection/product clicks, language/replays, and feedback activity. The player funnel counts unique visitors within one hour; total play events count individual runs. Survey responses are deduplicated using their submission ID, including partial responses. Feedback link clicks and anonymous responses have different coverage and are not presented as a response-rate funnel.

Read repeated feedback, check whether the same issue appears in hints/wrong guesses or drop-off, choose one change, increment `game_version` when releasing gameplay changes, and compare the affected metrics by version. Small samples are directional. No recurring message or scheduled review was created.

These are new operational measures. This connection lacks Data Catalog scopes, so governed metric definitions could not be checked. The saved insights are not canonical business metrics.

### Current delivery state

The forms and dashboard are live. Website source is prepared in branch `feat/after-hours-feedback`; deployment is pending because GitHub is unreachable from this workspace. Empty gameplay charts are expected until deployment, Analytics consent and real activity. The live ingestion of a gameplay event or submitted feedback response has not been verified.

New telemetry tests cover completion/entry deduplication, visible play time, per-run IDs, hints, wrong guesses and page-hide behavior. A bundled runtime test verifies no client initialization/capture before consent, no pre-consent replay, and capture stopping after withdrawal. These checks do not replace real-browser end-to-end verification.


Final local checks: 86 tests passed and one existing database-dependent test skipped; TypeScript, targeted ESLint, whitespace validation and `npm run build -- --webpack` passed. The build used the existing product-media fallback because this local environment has no Supabase URL. Gameplay browser QA, live ingestion and database integrations remain unverified for this change.
