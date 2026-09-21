import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo/json-ld";

type Props = { items: BreadcrumbItem[]; className?: string };

/**
 * Visible breadcrumb trail plus matching BreadcrumbList JSON-LD, so the markup always mirrors
 * what users see. The last item is the current page and is not linked.
 */
export default function Breadcrumbs({ items, className = "mb-2" }: Props) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav
        aria-label="Breadcrumb"
        className={`text-sm ${className}`}
        style={{ color: "var(--color-text-secondary)" }}
      >
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <span key={item.path}>
              {index > 0 && " / "}
              {isCurrent ? (
                <span aria-current="page" style={{ color: "var(--color-text-primary)" }}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:underline">
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
