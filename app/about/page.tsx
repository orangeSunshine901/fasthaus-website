import AboutScrollStory from "@/components/about/AboutScrollStory";
import ShopLayout from "@/components/layout/ShopLayout";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "About Fasthaus | Lighting Design Studio in the UAE",
  absoluteTitle: true,
  description:
    "Fasthaus designs sculptural lamps in-house and makes each one to order in Sharjah from plant-based material. Simple forms, soft glow and a little story.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ShopLayout showAnnouncement={false}>
      <AboutScrollStory />
    </ShopLayout>
  );
}
