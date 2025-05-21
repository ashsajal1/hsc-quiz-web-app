import { Outlet } from "react-router-dom";
import Navbar from "../components/partials/navbar";
import Footer from "../components/partials/footer";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeakerStore } from "@/store/useSpeakerStore";
import { NuqsAdapter } from "nuqs/adapters/react";

export default function RootLayout() {
  const { stop, isSpeaking } = useSpeakerStore();
  return (
    <NuqsAdapter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow p-2 mt-[80px]">
          <Outlet />
        </main>
        <Button size={"icon"} className="fixed bottom-6 right-6">
          {isSpeaking ? (
            <VolumeX onClick={stop} strokeWidth={"1"} className="h-6 w-6" />
          ) : (
            <Volume2 onClick={stop} strokeWidth={"1"} className="h-6 w-6" />
          )}
        </Button>
        <Footer />
      </div>
    </NuqsAdapter>
  );
}
