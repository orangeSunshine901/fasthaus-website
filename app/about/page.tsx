import Image from "next/image";
import ShopLayout from "@/components/layout/ShopLayout";

const philosophy = [
  { icon: "○", label: "Simple", desc: "Forms reduced to their essence — nothing more than what the light needs." },
  { icon: "◇", label: "Functional", desc: "Integrated into real desks, shelves and bedside tables, not just photos." },
  { icon: "△", label: "Warm", desc: "Diffused glow that feels nurturing for comfort in the evening." },
  { icon: "□", label: "Timeless", desc: "Quiet objects meant to stay with you, not follow trends." },
];

const materials = ["PLA", "PETG", "Aluminium", "Acrylic"];

export default function AboutPage() {
  return (
    <ShopLayout>
      <div className="container-page py-10 md:py-14">
        <h1 className="type-display-xl mb-3" style={{ color: "var(--color-text-primary)" }}>
          About FastHaus
        </h1>
        <p className="type-body-md mb-12 max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
          Fasthaus is a design-led lighting studio creating modern lamps through digital fabrication and thoughtful craftsmanship.
        </p>

        {/* Our Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
          <div className="media-rounded relative" style={{ aspectRatio: "4/3" }}>
            <Image src="/luna-lamp-rendering.png" alt="Our story" fill className="object-cover" />
          </div>
          <div>
            <h2 className="type-display-lg mb-4" style={{ color: "var(--color-text-primary)" }}>
              Our Story
            </h2>
            <p className="type-body-md mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Fasthaus began with a simple belief: lighting should bring warmth and character to everyday spaces. Based in Dubai, we design and produce every lamp in-house — combining digital fabrication with hands-on finishing to create pieces that feel both modern and human.
            </p>
            <p className="type-body-md" style={{ color: "var(--color-text-secondary)" }}>
              Small-batch production lets us obsess over detail, reduce waste, and keep evolving each design based on how people actually live with light.
            </p>
          </div>
        </div>

        {/* Design Philosophy */}
        <h2 className="type-display-lg mb-8" style={{ color: "var(--color-text-primary)" }}>
          Design Philosophy
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {philosophy.map((p) => (
            <div key={p.label}>
              <span className="text-[24px] mb-3 block" style={{ color: "var(--color-accent-amber)" }}>{p.icon}</span>
              <h3 className="type-title-md mb-1" style={{ color: "var(--color-text-primary)" }}>{p.label}</h3>
              <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Materials */}
        <h2 className="type-display-lg mb-4" style={{ color: "var(--color-text-primary)" }}>
          Materials
        </h2>
        <div className="flex gap-3 flex-wrap mb-16">
          {materials.map((m) => (
            <span
              key={m}
              className="type-badge rounded-full border px-4 py-1.5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              {m}
            </span>
          ))}
        </div>

        {/* Inside the Studio */}
        <h2 className="type-display-lg mb-6" style={{ color: "var(--color-text-primary)" }}>
          Inside the Studio
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {["/our-process-img.png", "/collections-hero-img-1.png", "/collections-hero-img-2.png"].map((img, i) => (
            <div key={i} className="media-rounded relative" style={{ aspectRatio: "1/1" }}>
              <Image src={img} alt="Studio" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
