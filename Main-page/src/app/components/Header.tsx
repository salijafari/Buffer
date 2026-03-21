import { Link } from "react-router";
import imgLogo from "@/assets/buffer-logo.png";
import { useBffAuth } from "@/lib/BffAuthContext";
import { bffLoginUrl, bffLogout } from "@/lib/bffSession";

export function Header() {
  const { state } = useBffAuth();
  const loading = state.status === "loading";
  const authenticated = state.status === "auth";
  const user = state.status === "auth" ? state.user : null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="flex h-[56px] md:h-[70px] items-center justify-between gap-3">
          <div className="flex items-center">
            <Link to="/">
              <img src={imgLogo} alt="Buffer" className="h-[24px] md:h-[33px] w-auto" />
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

          {loading ? (
            <span className="text-sm text-gray-500">…</span>
          ) : !authenticated ? (
            <button
              type="button"
              className="bg-black text-white px-5 md:px-8 py-2 md:py-2.5 rounded-[12px] md:rounded-md text-sm font-semibold hover:bg-gray-800 transition whitespace-nowrap"
              onClick={() => {
                window.location.href = bffLoginUrl({ returnTo: "/" });
              }}
            >
              Log in / Sign up
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {user?.picture ? (
                <img src={user.picture} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : null}
              <button
                type="button"
                className="text-sm font-semibold text-gray-800 hover:text-gray-600"
                onClick={() => void bffLogout()}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
