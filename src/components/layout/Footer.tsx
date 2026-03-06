import Link from "next/link";
import Container from "./Container";

const Footer = () => {
  return (
    <footer className="relative z-10 pt-32 pb-12 px-6 border-t border-[#DEE0E3] bg-[#F5F6F7]/30">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1F2329]">
                MyLark
              </span>
            </div>
            <p className="text-[#646A73] text-sm leading-relaxed max-w-xs">
              Pioneering the future of urban infrastructure through intelligent,
              data-driven synchronization.
            </p>
          </div>

          <div>
            <h4 className="text-[#1F2329] font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-[#646A73]">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  AI Insights
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Case City
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  API Docs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1F2329] font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-[#646A73]">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Press Room
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1F2329] font-semibold mb-6">Newsletter</h4>
            <p className="text-sm text-[#646A73] mb-4">
              Stay synchronized with the latest urban tech.
            </p>
            <div className="flex">
              <input
                type="text"
                placeholder="Email address"
                className="bg-white border border-[#DEE0E3] rounded-l-full px-4 py-2 text-sm text-[#1F2329] focus:outline-none focus:border-primary/50 w-full"
              />
              <button className="bg-primary text-white border border-primary px-4 py-2 text-sm font-medium rounded-r-full hover:bg-primary/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-[#DEE0E3] flex flex-col md:flex-row justify-between items-center text-xs text-[#646A73]/70 space-y-4 md:space-y-0">
          <p>© 2026 MyLark Technologies Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Status
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
