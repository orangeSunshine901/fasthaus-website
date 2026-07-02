import AnnouncementBar from "./AnnouncementBar";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function ShopLayout({
  children,
  showAnnouncement = true,
}: {
  children: React.ReactNode;
  showAnnouncement?: boolean;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {showAnnouncement ? (
        <AnnouncementBar />
      ) : (
        <div className="h-[32px] flex-none" aria-hidden="true" />
      )}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
