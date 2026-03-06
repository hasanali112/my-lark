import Link from "next/link";
import Button from "../ui/Button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 px-4">
      <div className="bg-white/80 backdrop-blur-md max-w-7xl w-full px-6 py-3 flex items-center justify-between rounded-full border border-[#DEE0E3] shadow-sm">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 group cursor-pointer"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <span className="text-white font-bold">U</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1F2329] group-hover:text-primary transition-colors">
            UrbanSync
          </span>
        </Link>
        ...
        {/* Links - Desktop */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#646A73]">
          <Link href="#" className="hover:text-primary transition-colors">
            Solutions
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Technology
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Case Studies
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>
        {/* Auth Actions */}
        <div className="flex items-center space-x-4">
          <Link
            href="/auth/login"
            className="hidden sm:block text-sm font-medium text-[#646A73] hover:text-primary transition-colors"
          >
            Log In
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
