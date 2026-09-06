# Mobile gallery portraits

Run `npm run images:portraits` with Google Chrome installed to regenerate the mobile gallery's 3:4 crops. FilePond's Crop, Resize, and Transform plugins run in an isolated headless browser with page network requests blocked. No upload service is involved.

Edit `gallery-portrait-crops.json` to add landscape sources or adjust the normalized crop center (`x` and `y` range from 0 to 1). Review the generated images after changing a crop. The command writes JPEGs at quality 90, at most 1080 × 1440 pixels, without upscaling smaller sources. Cropping removes the sides of the landscape composition; close-up shots remain close-ups.

Outputs live in `public/gallery-portraits/`; `lib/data/gallery-portraits.ts` maps their original paths to portrait paths. The product gallery applies the mapping only to mobile sources, including separately configured main images. Existing portrait assets and desktop originals are preserved. Next.js continues to optimize delivery of the generated JPEGs.

For another installed Playwright browser channel, set `PORTRAIT_BROWSER` (for example, `msedge`).
