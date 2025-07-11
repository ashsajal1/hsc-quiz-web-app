import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/partials/navbar";
import Footer from "../components/partials/footer";
import { VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeakerStore } from "@/store/useSpeakerStore";
import { NuqsAdapter } from "nuqs/adapters/react";

export default function RootLayout() {
  const { stop, isSpeaking } = useSpeakerStore();
  const location = useLocation();
  const isDropGamePage = location.pathname === '/drop-game';

  const mainClassName = isDropGamePage ? "flex-grow" : "flex-grow p-2 mt-[80px]";

  return (
    <NuqsAdapter>
      <div className="min-h-screen flex flex-col">
        
        {!isDropGamePage && <Navbar />}
        <main className={mainClassName}>
          <Outlet />
        </main>
        {isSpeaking && (
          <Button size={"icon"} className="fixed bottom-6 right-6">
            <VolumeX onClick={stop} strokeWidth={"1"} className="h-6 w-6" />
          </Button>
        )}
        {!isDropGamePage && <Footer />}
      </div>
    </NuqsAdapter>
  );
}
