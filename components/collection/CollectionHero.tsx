"use client";

import dynamic from "next/dynamic";

const UnicornScene = dynamic(() => import("unicornstudio-react"), { ssr: false });

export default function CollectionHero() {
  return (
    <section className="relative h-[60svh] min-h-[420px] w-full overflow-hidden md:h-screen md:min-h-[780px]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-full">
            <UnicornScene
              projectId="GUtXoEosjH4L5DFLpEjE"
              width="100%"
              height="100%"
              scale={1}
              dpi={1.5}
              sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js"

              // style={{ width: "100vw", height: "100%" }}
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-0" />
    </section>
  );
}
