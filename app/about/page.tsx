import AboutScrollStory from "@/components/about/AboutScrollStory";
import ShopLayout from "@/components/layout/ShopLayout";
import LocomotiveScrollProvider from "@/components/scroll/LocomotiveScrollProvider";

export default function AboutPage() {
  return (
    <LocomotiveScrollProvider>
      <ShopLayout showAnnouncement={false}>
        <AboutScrollStory />
      </ShopLayout>
    </LocomotiveScrollProvider>
  );
}
