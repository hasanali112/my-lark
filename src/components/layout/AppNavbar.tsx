import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "./Container";

const AppNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-primary/15">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-semibold">
            U
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1F2329]">UrbanSync</p>
            <p className="text-[11px] text-[#6B7280]">Workspace</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#6B7280]">
          <Link href="/community" className="hover:text-primary">
            Community
          </Link>
          <Link href="/community/chat" className="hover:text-primary">
            Messages
          </Link>
          <Link href="/community/friends" className="hover:text-primary">
            People
          </Link>
          <Link href="/community/profile/me" className="hover:text-primary">
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Online
            <span className="h-2 w-2 rounded-full bg-green-500" />
          </div>
          <Button size="sm" variant="outline">
            Settings
          </Button>
        </div>
      </Container>
    </nav>
  );
};

export default AppNavbar;
