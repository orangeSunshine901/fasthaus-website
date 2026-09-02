import AnnouncementBar from "./AnnouncementBar";
import Footer from "./Footer";
import Navbar from "./Navbar";
import HomeFirstScrollReveal from "../home/HomeFirstScrollReveal";

export default function ShopLayout({
  children,
  showAnnouncement = true,
  revealOnFirstScroll = false,
}: {
  children: React.ReactNode;
  showAnnouncement?: boolean;
  revealOnFirstScroll?: boolean;
}) {
  return (
    <div
      className={`flex flex-col min-h-screen${revealOnFirstScroll ? " bg-[#000104]" : ""}`}
      data-home-reveal={revealOnFirstScroll ? "pending" : undefined}
      data-home-content={revealOnFirstScroll ? "pending" : undefined}
    >
      {revealOnFirstScroll && <HomeFirstScrollReveal />}
      {showAnnouncement && <AnnouncementBar revealOnFirstScroll={revealOnFirstScroll} />}
      <Navbar revealOnFirstScroll={revealOnFirstScroll} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
