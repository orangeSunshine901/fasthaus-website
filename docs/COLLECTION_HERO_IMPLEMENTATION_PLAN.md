# Collection Hero Carousel Implementation Plan

## Objective

Transform the existing collection hero into a four-slide editorial carousel where each slide synchronizes:

- The WebGL shader palette
- The lamp image
- The oversized editorial lamp name behind the product
- The lamp colour name beneath the product
- The slide counter and navigation controls

Slide changes should use a smooth S-curve crossfade with ease-in and ease-out behavior. The shader should continue running while its colours interpolate, rather than restarting for each slide.

## Existing project capabilities

The project already includes everything needed:

- `embla-carousel-react` for swipe, carousel state, looping, and navigation
- `motion` for keyed crossfades and transform animation
- `next/image` for responsive lamp assets
- `lucide-react` for arrow icons
- The existing WebGL renderer in `components/collection/CollectionHero.tsx`

No new dependency is required.

## Files to update

### `app/collection/page.tsx`

- Define the four collection hero slides.
- Pass the slide array into `CollectionHero`.
- Remove the single static `COLLECTION_HERO_COLORS` value.

### `components/collection/CollectionHero.tsx`

- Change the component API from a single palette to a collection of slides.
- Add Embla carousel state and controls.
- Add the editorial title, lamp image, colour label, slide counter, and arrows.
- Animate the visible slide content with Motion.
- Refactor the WebGL lifecycle so the shader is initialized once.
- Interpolate shader colours during slide transitions.
- Add keyboard, screen-reader, and reduced-motion behavior.

## Slide data model

Add a reusable slide type:

```tsx
export type CollectionHeroSlide = {
  id: string;
  lampName: string;
  colorName: string;
  image: string;
  colors: readonly [string, string, string, string];
};
```

Define the initial slides in `app/collection/page.tsx`:

```tsx
const COLLECTION_HERO_SLIDES = [
  {
    id: "stack-blue",
    lampName: "STACK",
    colorName: "BLUE",
    image: "/stack-lamp/stack-lamp-blue-off.png",
    colors: ["#101522", "#155EEF", "#C8DBFF", "#F7F9FF"],
  },
  {
    id: "pearl-red",
    lampName: "PEARL",
    colorName: "RED",
    image: "/pearl-lamp/pearl-lamp-red-off.png",
    colors: ["#171013", "#D62335", "#FFD1CC", "#FFF7F4"],
  },
  {
    id: "mushroom-orange",
    lampName: "MUSHROOM",
    colorName: "ORANGE",
    image: "/mushroom-lamp/mushroom-orange-off.png",
    colors: ["#141114", "#FF4B1F", "#FFDBD2", "#F8F6F3"],
  },
  {
    id: "flute-matcha",
    lampName: "FLUTE",
    colorName: "MATCHA",
    image: "/flute-lamp/flute-matcha-off.png",
    colors: ["#101711", "#75984D", "#DCE8B9", "#F7F7ED"],
  },
] as const satisfies readonly CollectionHeroSlide[];
```

These image paths can serve as placeholders. Replacing the final lamp artwork should only require changing the relevant `image` value.

Render the hero with:

```tsx
<CollectionHero slides={COLLECTION_HERO_SLIDES} />
```

## Component state

`CollectionHero` should own:

```tsx
const [selectedIndex, setSelectedIndex] = useState(0);
const [direction, setDirection] = useState<1 | -1>(1);
```

It should derive the active slide from the selected index:

```tsx
const activeSlide = slides[selectedIndex];
```

The direction value can be used for subtle direction-aware content movement while retaining a crossfade as the dominant transition.

## Embla carousel setup

Initialize Embla with:

```tsx
const [emblaRef, emblaApi] = useEmblaCarousel({
  loop: true,
  align: "center",
  skipSnaps: false,
});
```

Responsibilities:

- Support touch and pointer swiping.
- Loop continuously between the first and final slides.
- Update `selectedIndex` from Embla's `select` event.
- Keep arrow navigation and swipe navigation synchronized.
- Expose previous and next methods for the bottom-right controls.

The Embla slides can be visually hidden or transparent because the visible editorial scene will be rendered as overlapping Motion layers. Embla remains responsible for gesture recognition and carousel state.

## Visual composition

Use the following stacking order:

| Layer          | Content            | Suggested z-index |
| -------------- | ------------------ | ----------------: |
| Background     | WebGL canvas       |             `z-0` |
| Editorial type | Active lamp name   |            `z-10` |
| Product        | Active lamp image  |            `z-20` |
| Supporting UI  | Colour name        |            `z-30` |
| Controls       | Counter and arrows |            `z-40` |

### Editorial title

- Display the active lamp name in uppercase.
- Center it behind the lamp.
- Keep it on one line on desktop.
- Use lightweight, tightly tracked typography.
- Scale responsively with `clamp()`.

Suggested styling:

```tsx
className =
  "absolute left-1/2 top-[46%] z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(64px,11vw,180px)] font-light leading-none tracking-[-0.06em] text-[#141114]";
```

### Lamp image

- Center the lamp in the hero.
- Keep the entire silhouette visible.
- Use transparent-background lamp artwork for the final assets.
- Place the lamp above the title to create the editorial overlap.
- Use `object-contain` to avoid cropping.

Suggested sizing:

```tsx
className = "relative z-20 h-auto w-[min(68vw,680px)] object-contain md:w-[min(42vw,700px)]";
```

### Colour name

- Position directly beneath the lamp.
- Use uppercase text with wide letter spacing.
- Update together with the lamp and title.
- Keep it centered independently of individual lamp dimensions.

Suggested styling:

```tsx
className =
  "absolute bottom-[12%] left-1/2 z-30 -translate-x-1/2 text-xs font-semibold uppercase tracking-[0.24em]";
```

### Counter and arrows

Match the reference layout:

```text
01 / 04       ←    →
```

- Place the controls in the bottom-right corner.
- Use `ArrowLeft` and `ArrowRight` from `lucide-react`.
- Keep the icons visually unboxed.
- Give each button a minimum `44 × 44px` interactive area.
- Use two-digit counter formatting.
- Preserve visible focus styles for keyboard users.

## DOM content transitions

Use `AnimatePresence` from `motion/react` with `mode="sync"`. This keeps the outgoing and incoming scenes visible at the same time so they can crossfade without an empty frame.

Use one shared transition curve:

```tsx
const SLIDE_TRANSITION = {
  duration: 0.9,
  ease: [0.65, 0, 0.35, 1],
};
```

This cubic Bezier produces the requested S-curve: slow acceleration, smooth movement through the midpoint, and slow deceleration.

### Lamp animation

```tsx
const lampVariants = {
  enter: {
    opacity: 0,
    scale: 0.975,
    y: 12,
  },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 1.015,
    y: -8,
  },
};
```

### Editorial title animation

```tsx
const titleVariants = {
  enter: {
    opacity: 0,
    y: 18,
  },
  center: {
    opacity: 0.9,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -14,
  },
};
```

### Colour label animation

- Fade slightly after the lamp begins entering.
- Use the same S-curve and a short delay of approximately `0.08s`.
- Keep movement minimal so the label remains easy to read.

## Shader colour transition

### Current issue

The existing WebGL effect depends on the `colors` prop. Changing the palette reruns the effect, recreates the WebGL program, and resets the shader animation. That can cause a visible jump or flicker.

### Required refactor

Keep the WebGL program mounted for the lifetime of the component:

1. Initialize the WebGL context, shaders, buffers, and uniform locations once.
2. Store the currently rendered RGB palette in a ref.
3. Store the target slide palette in another ref.
4. On slide change, copy the currently displayed palette into `fromColors`.
5. Set the active slide palette as `toColors`.
6. Record the transition start time.
7. Interpolate the twelve RGB values during each animation frame.
8. Upload the interpolated values through `u_colors`.

The WebGL animation time must continue uninterrupted during palette changes.

### Shader easing

Use a smootherstep curve for an S-shaped transition:

```tsx
function smootherstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
```

Calculate transition progress inside the render loop:

```tsx
const COLOR_TRANSITION_DURATION = 900;

const progress = Math.min(1, (performance.now() - transitionStartedAt) / COLOR_TRANSITION_DURATION);

const easedProgress = smootherstep(progress);
```

Interpolate every RGB channel:

```tsx
currentColor[channel] =
  fromColor[channel] + (toColor[channel] - fromColor[channel]) * easedProgress;
```

### Interrupted transitions

Do not disable the arrows during a transition. If another slide is selected before the current transition completes:

1. Capture the currently interpolated palette.
2. Use that palette as the next transition's starting point.
3. Set the newly selected slide palette as the destination.
4. Restart the transition timer.

This prevents snapping during rapid arrow clicks or quick swipes.

## Responsive behavior

### Desktop

- Use the existing full-screen hero height.
- Keep the title on one line.
- Center the lamp over the title.
- Keep the counter and controls aligned to the lower-right safe area.

### Mobile

- Preserve swipe navigation.
- Reduce title size with `clamp()`.
- Allow especially long lamp names to reduce in size rather than overflow.
- Scale the lamp according to available height as well as width.
- Move the colour label upward enough to clear browser safe areas.
- Retain `44px` arrow button targets even if the visible icons remain small.
- Ensure the controls do not overlap the consent interface.

## Accessibility

Add the following behavior:

- Give the hero `aria-roledescription="carousel"`.
- Label the overall region as the Fasthaus lamp collection.
- Give every slide an accessible name.
- Mark the active slide with `aria-current` where appropriate.
- Add descriptive labels to previous and next buttons.
- Support left and right arrow keys while focus is within the hero.
- Announce slide changes through an `aria-live="polite"` status element.

Example announcement:

```text
Pearl lamp, Red, slide 2 of 4
```

Each lamp image should use meaningful alternative text, for example:

```tsx
alt={`${activeSlide.lampName} lamp in ${activeSlide.colorName}`}
```

## Reduced motion

Use Motion's `useReducedMotion()` and the browser media query for the canvas.

When reduced motion is enabled:

- Do not translate or scale the title and lamp.
- Use a short opacity-only fade or change immediately.
- Snap the shader palette to the selected colours.
- Keep the shader static or reduce its time-based movement substantially.

## Image behavior

- Use `next/image` for every lamp.
- Give the first lamp `priority` because it appears above the fold.
- Preload or eagerly load the adjacent slide where practical.
- Use accurate `sizes` values to avoid downloading oversized assets.
- Keep all final lamp files on transparent backgrounds.
- Preserve similar visual bounds across all four source images so the lamps do not appear to jump in size.

## Performance requirements

- Do not recreate the WebGL program during slide changes.
- Reuse the existing canvas and animation frame.
- Continue pausing animation when the browser tab is hidden.
- Cap device pixel ratio at the existing maximum of `2`.
- Animate only opacity and transform for DOM layers.
- Avoid React state updates inside the WebGL animation frame.
- Keep the interpolated palette in typed arrays and refs.

## Implementation sequence

1. Add the typed slide data to `app/collection/page.tsx`.
2. Change the `CollectionHero` API to accept `slides`.
3. Add Embla and synchronize its selected index with React state.
4. Add the title, lamp, colour label, counter, and arrow layers.
5. Add keyed Motion crossfades using the shared `900ms` S-curve.
6. Refactor WebGL initialization so slide changes do not recreate the shader.
7. Add RGB palette interpolation to the existing animation loop.
8. Add interrupted-transition handling.
9. Add responsive positioning and sizing.
10. Add keyboard navigation, announcements, and reduced-motion behavior.
11. Replace the temporary image paths when the final lamp renders are available.
12. Run automated and manual verification.

## Verification checklist

### Functionality

- Previous and next buttons loop correctly.
- Swipe navigation works on touch devices.
- Keyboard navigation works when the hero is focused.
- Counter, title, colour label, image, and shader always show the same slide.
- Rapid navigation does not produce stale content or palette snapping.

### Animation

- The lamp crossfade has no blank frame.
- The title remains visibly behind the lamp.
- The colour label changes with the correct slide.
- The shader animation does not restart during a palette change.
- The colour transition takes approximately `900ms`.
- Entering and exiting use the same S-curve timing.

### Layout

- Verify at approximately `375px`, `768px`, `1024px`, and `1440px` widths.
- Long titles do not clip horizontally.
- Lamps remain fully visible.
- Controls do not overlap the navbar, colour label, or consent controls.
- The next section begins cleanly after the hero.

### Accessibility

- Focus indicators are visible.
- Buttons have descriptive accessible names.
- Slide changes are announced once.
- Reduced-motion behavior removes large movement.
- Images have useful alternative text.

### Project checks

Run:

```bash
npm run lint
npm run build
```

## Acceptance criteria

The feature is complete when:

- Four lamps can be configured through one typed slide array.
- Each slide displays its own lamp, editorial title, colour label, and palette.
- The editorial title appears behind the lamp.
- The counter and arrow positioning match the visual reference.
- Swipe, arrow buttons, looping, and keyboard navigation work.
- All visual layers transition with a synchronized ease-in-out S-curve.
- The shader smoothly interpolates colours without restarting.
- Final images can be swapped by changing only the slide `image` paths.
- Reduced-motion and accessible navigation are supported.
- Lint and production build complete successfully.
