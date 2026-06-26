"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const UnicornScene = dynamic(() => import("unicornstudio-react"), { ssr: false });

export default function CollectionHero() {
  return (
    <section className="relative w-screen h-screen min-h-[780px] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-full">
            <UnicornScene
              projectId="DeUHgGVaUUmVEBzn7d74"
              width="100%"
              height="95vh"
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
