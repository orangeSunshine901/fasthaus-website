import Link from "next/link";
import ShopLayout from "@/components/layout/ShopLayout";

export default function NotFound() {
  return (
    <ShopLayout>
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <h1
          className="text-9xl font-semibold mb-4"
          style={{ color: "var(--color-accent-amber)" }}
        >
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Looks like this lamp has gone out.
        </h2>
        <p className="text-base mb-8" style={{ color: "var(--color-text-secondary)" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: "var(--color-accent-amber)" }}
          >
            Return home
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-full text-sm font-medium border"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Shop collection
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}
