import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import svgPaths from "../../imports/svg-jihryzq5ee";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "why west java ?", path: "/" },
    { label: "where to visit ?", path: "/directory" },
    { label: "what to do ?", path: "/videos" },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden md:block pointer-events-none">
        <div className="flex justify-center px-[70px] pt-0">
          <div
            className={`bg-white rounded-bl-[50px] rounded-br-[50px] transition-all duration-300 pointer-events-auto shadow-md relative ${
              isScrolled ? "h-[104px] w-full" : isHomePage ? "h-[214px] w-full" : "h-[104px] w-full"
            }`}
            style={{ maxWidth: "1131px" }}
          >
            {/* Navigation Menu */}
            <nav className="absolute top-[35px] left-0 right-0 flex justify-center gap-[150px] px-[70px]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-black hover:text-[#2645cf] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Hero Content - Only show when not scrolled and on home page */}
            {!isScrolled && isHomePage && (
              <div className="absolute top-[105px] left-[70px] right-[70px] flex items-center justify-between px-0">
                <div className="font-['Inter:Regular',sans-serif] font-normal text-[32px] text-black">
                  <p className="mb-0 leading-[1.1]">Smiling</p>
                  <p className="leading-[1.1]">West Java</p>
                </div>
                <Link
                  to="/videos"
                  className="bg-[#2645cf] hover:bg-[#1e37a8] transition-colors h-[37px] rounded-[15px] w-[249px] flex items-center justify-center"
                >
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-white">
                    Discover More
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden pointer-events-none">
        <div className="px-[17px] pt-0">
          <div
            className={`bg-white rounded-bl-[50px] rounded-br-[50px] transition-all duration-300 pointer-events-auto shadow-md relative ${
              isScrolled ? "h-[104px]" : isHomePage ? "h-[214px]" : "h-[104px]"
            }`}
          >
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="absolute left-[44px] top-[30px] h-[14px] w-[30px] z-10"
              aria-label="Toggle menu"
            >
              <svg className="block size-full" fill="none" viewBox="0 0 33 17">
                <path
                  d={svgPaths.p23725900}
                  stroke="#919191"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
            </button>

            {/* Hero Content - Mobile */}
            {!isScrolled && isHomePage && (
              <div className="pt-[60px] px-[38px] pb-4">
                <div className="font-['Inter:Regular',sans-serif] font-normal text-[32px] text-black mb-4">
                  <p className="mb-0 leading-[1.1]">Smiling</p>
                  <p className="leading-[1.1]">West Java</p>
                </div>
                <Link
                  to="/videos"
                  className="bg-[#2645cf] hover:bg-[#1e37a8] transition-colors h-[37px] rounded-[15px] w-full max-w-[249px] flex items-center justify-center mx-auto"
                >
                  <span className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-white">
                    Discover More
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-[120px] left-[17px] right-[17px] bg-white rounded-[20px] shadow-lg p-6 pointer-events-auto">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-black hover:text-[#2645cf] transition-colors py-2"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/regulations"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-black hover:text-[#2645cf] transition-colors py-2"
              >
                regulations
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from being hidden under fixed header - only for non-home pages */}
      {!isHomePage && (
        <div className="h-[104px]" />
      )}
    </>
  );
}