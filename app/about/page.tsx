import AboutScrollStory from "@/components/about/AboutScrollStory";
import ShopLayout from "@/components/layout/ShopLayout";

export default function AboutPage() {
  return (
    <ShopLayout showAnnouncement={false}>
      <AboutScrollStory />
    </ShopLayout>
  );
}
