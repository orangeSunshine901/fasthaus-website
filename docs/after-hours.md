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

The game continues dispatching document events `fasthaus:start`, `fasthaus:discovery`, `fasthaus:hint`, `fasthaus:complete` and `fasthaus:restart`. Existing detail fields and `prototype: true` remain to avoid breaking integrations. The public route does not change that legacy payload flag. No new analytics integration or invitation tracking was added.

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
