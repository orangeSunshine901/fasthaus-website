# Product media studio

The team editor lives at `/admin`. Colleagues enter one shared password, select a product and colour, and update image placements or the product gallery. Draft changes stay in the current browser tab until **Review & publish**. Product and colour switches retain drafts. Reloading or signing out discards unpublished changes; the browser warns before leaving.

## Enable the editor

1. Apply `supabase/migrations/20261014110737_product_media_cms.sql` to the intended Supabase project using the existing migration workflow. It adds two private tables and the public `product-media` image bucket. Review and apply this migration before setting the environment variable below.
2. In Supabase Auth, create one confirmed user for the team. Use a dedicated email address and a strong, unique password of at least 16 characters. No colleague invitations or emails are required. Only this exact account can use the editor; other Supabase users are denied.
3. Set server-only `CMS_AUTH_EMAIL` to that user's email address in the application environment. Existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` remain required. The shared password is managed by Supabase Auth, never stored in a public environment variable.
4. Restart/redeploy the application. Visit `/admin`, sign in, and verify one image upload and publish on a preview deployment before enabling production.

Removing `CMS_AUTH_EMAIL` disables editor access and returns the storefront to its original images. Database rows and uploads are retained.

## Image checks

- JPEG, PNG, WebP and AVIF only; at most 4 MiB per file. SVG and animated images are rejected.
- Minimum 1200px on the long side and 800px on the short side; recommended 1600 × 1200px or larger. Below-recommendation images receive a warning.
- Server independently inspects actual file contents, caps decoded input at 40 megapixels, and rejects decode errors and truncated files.
- Accepted files are oriented correctly, resized to fit within 2400 × 2400px without enlargement, and converted to WebP at quality 90. Transparency is retained; private EXIF metadata is stripped.
- Pixel dimensions do not establish focus, composition or aesthetic quality. Use the full-image preview to inspect these before publishing. Separate mobile images remain editable.

## Publishing and access

The editor updates only image fields. Product identities, prices, stock, and checkout behaviour retain the existing catalog source. Changes reach product galleries, homepage product cards, collection cards and featured collection spotlights, navigation previews, product SEO images, and cart images. General homepage imagery, videos, add-ons, outlines, and About-page imagery are outside this first version.

Required homepage/collection images cannot be removed, and every gallery must retain at least one image. Gallery order can be changed by dragging or using keyboard-accessible arrow buttons. Optional mobile images fall back to the desktop photo. Clearing a collection spotlight override restores its original image.

Each publish uses a version check. If another colleague published the same colour, the server rejects the stale draft and leaves it on screen for review. Reload to fetch the latest version before editing again. A successful publish invalidates cached storefront media and page layouts. Refresh already-open storefront tabs to receive the latest images.

All edit/upload/publish routes verify the team account with Supabase, require same-origin requests, and use server-only privileged credentials. CMS sessions use a separate HttpOnly cookie, Secure in production, with SameSite=Lax. Tables have RLS enabled with no public API grants or policies; storage permits public image reads, with writes available only through the protected server. Uploaded URLs must match files recorded by the upload route.

The app adds a per-instance sign-in throttle on top of Supabase Auth's rate limits. A shared account cannot identify individual editors or revoke just one colleague. Rotate the password and revoke the account's active sessions in Supabase when team access changes.

Removed/replaced photos remain in storage for recovery, including uploads from discarded drafts. There is no automatic garbage collection or version-history UI in this first version. Published files are public website assets; do not upload confidential media.

## Verification

Run `npm test`, `npx tsc --noEmit`, `npm run lint` and `npm run build -- --webpack`. On the intended configured project, check wrong-password rejection, sign-in, sign-out, direct unauthenticated write rejection, low-resolution upload rejection, a real upload/publish, desktop/mobile galleries and product cards, and a two-tab stale-publish conflict. Confirm anonymous and ordinary authenticated API users cannot write either table or the storage bucket.

Implementation checks on 14 October 2026: 53 tests passed; TypeScript and the production build passed; lint had no errors and two existing warnings. Chrome checks against an isolated Supabase fixture covered login/logout, HttpOnly cookies, upload and resolution errors, previews, gallery reorder/publish, initial and subsequent version conflicts, origin and URL validation, mobile overflow, and image propagation to product, homepage, collection and category pages. The SQL migration and access assertions were executed in a transaction and rolled back. The live team account, actual Storage upload and deployment remain to be configured and verified.

Follow-up test access on 14 October 2026: the media migration is now applied to the connected Supabase project, and a dedicated confirmed test account is configured through `CMS_AUTH_EMAIL` in the ignored `.env.local` file. Test credentials are in the ignored, owner-only `artifacts/cms/test-login.json` file. Chrome verification against real Supabase passed sign-in, wrong-password rejection, HttpOnly cookies, unauthenticated-upload rejection, actual upload/public image delivery, and sign-out. The temporary test image and its database record were removed; no product images were published during verification. Security advisors reported no errors. Local testing is enabled at `http://localhost:3000/admin`; the website has not been redeployed. Uploads and published edits from this local editor use the connected Supabase project.
