import { Link } from "react-router";
import imgLogo from "@/assets/buffer-logo.png";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="flex h-[70px] items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img src={imgLogo} alt="Buffer" className="h-[45px] md:h-[55px] w-auto" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/#how-it-works" className="text-base text-black hover:text-gray-600 transition">
              How it works
            </a>
            <a href="/#faq" className="text-base text-black hover:text-gray-600 transition">
              FAQ
            </a>
            <Link to="/payoff-calculator" className="text-base text-black hover:text-gray-600 transition">
              Payoff calculator
            </Link>
          </nav>

          <button className="bg-black text-white px-8 py-2.5 rounded-md text-sm font-semibold hover:bg-gray-800 transition">
            Log in / Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
