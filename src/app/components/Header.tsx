import imgLogo from "@/assets/04fb4c7c0b18c1e25f6375f8b26f8eeeeeb88c9c.png";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="flex h-[70px] items-center justify-between">
          <div className="flex items-center">
            <img src={imgLogo} alt="Buffer" className="h-[55px] w-auto" />
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#faq" className="text-base text-black hover:text-gray-600 transition">
              FAQ
            </a>
            <a href="#blog" className="text-base text-black hover:text-gray-600 transition">
              Blog
            </a>
            <a href="#calculator" className="text-base text-black hover:text-gray-600 transition">
              Payoff calculator
            </a>
          </nav>

          <button className="bg-black text-white px-8 py-2.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition">
            Log in / Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
