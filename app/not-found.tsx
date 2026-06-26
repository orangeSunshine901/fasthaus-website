import Image from "next/image";
import Link from "next/link";
import ShopLayout from "@/components/layout/ShopLayout";

export default function NotFound() {
  return (
    <ShopLayout>
      <div className="flex flex-col items-center justify-center py-20 md:py-32 px-6 text-center">
        <div className="relative w-40 h-40 md:w-56 md:h-56 mb-6 opacity-80">
          <Image src="/luna-lamp-rendering.png" alt="Lamp" fill className="object-contain" />
        </div>
        <h1
          className="text-8xl md:text-9xl font-semibold mb-4"
          style={{ color: "var(--color-accent-amber)" }}
        >
          404
        </h1>
        <h2 className="type-md mb-3" style={{ color: "var(--color-text-primary)" }}>
          Looks like this lamp has gone out.
        </h2>
        <p className="type-base mb-10 max-w-sm" style={{ color: "var(--color-text-secondary)" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs sm:flex-row sm:max-w-none sm:w-auto">
          <Link href="/" className="btn btn-primary px-8">
            Return home
          </Link>
          <Link
            href="/collection"
            className="btn btn-outline px-8"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Shop collection
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}
