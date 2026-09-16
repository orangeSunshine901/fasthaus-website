export default function GlassFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="pointer-events-none absolute"
    >
      <defs>
        <filter
          id="fasthaus-glass-distortion"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.08"
            numOctaves="2"
            seed="7"
            stitchTiles="stitch"
            result="noise"
          />
          {/* A neutral green channel keeps displacement horizontal. */}
          <feColorMatrix
            in="noise"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0.5  0 0 1 0 0  0 0 0 0 1"
            result="horizontalNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="horizontalNoise"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
