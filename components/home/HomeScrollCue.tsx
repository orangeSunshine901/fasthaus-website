export default function HomeScrollCue() {
  return (
    <div className="home-scroll-cue pointer-events-none absolute inset-x-0 z-10 flex flex-col items-center gap-3 text-white">
      <svg
        className="hidden h-10 w-7 md:block"
        viewBox="0 0 28 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="1" width="22" height="36" rx="11" />
        <path className="home-scroll-cue-gesture" d="M14 9v6" strokeLinecap="round" />
      </svg>
      <svg
        className="h-10 w-7 md:hidden"
        viewBox="0 0 28 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="1" width="22" height="38" rx="5" />
        <path d="M11 5h6M11 35h6" strokeLinecap="round" />
        <g className="home-scroll-cue-gesture home-scroll-cue-swipe">
          <circle cx="14" cy="25" r="3" />
          <path d="M14 20v-8m-3 3 3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <span className="text-xs font-medium">
        <span className="hidden md:inline">Scroll to explore</span>
        <span className="md:hidden">Swipe up to explore</span>
      </span>
    </div>
  );
}
