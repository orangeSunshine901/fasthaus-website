import type { Metadata } from "next";
import { isCmsEditor } from "@/lib/cms/auth";
import { readMediaRows } from "@/lib/cms/products";
import type { MediaRow } from "@/lib/cms/media";
import { PRODUCTS } from "@/lib/data/products";
import MediaEditor from "@/components/cms/MediaEditor";
import TeamLogin from "@/components/cms/TeamLogin";

export const metadata: Metadata = {
  title: "Media studio",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = !!process.env.CMS_AUTH_EMAIL;
  if (!(await isCmsEditor())) return <TeamLogin configured={configured} />;
  let rows: MediaRow[] | null = null;
  try {
    rows = await readMediaRows();
  } catch (error) {
    console.error("CMS could not load media", error);
  }
  if (!rows)
    return (
      <main className="mx-auto max-w-xl p-10">
        <h1 className="text-2xl font-bold">Media studio is unavailable</h1>
        <p className="mt-4">
          We couldn’t load your saved images. Please try again after the media database has been
          configured.
        </p>
        <a href="/admin" className="btn btn-primary mt-6">
          Try again
        </a>
      </main>
    );
  return <MediaEditor products={PRODUCTS} rows={rows} />;
}
