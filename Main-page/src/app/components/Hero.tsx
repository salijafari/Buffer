import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import imgPhone from "@/assets/HeroSectionImage2.png";
import imgAppleIcon from "@/assets/9bacaaf934ba616b78ec2d4b9d012296ff799217.png";

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M17.523 15.341C17.14 15.341 16.83 15.03 16.83 14.648V8.875c0-.382.31-.693.693-.693.382 0 .693.311.693.693v5.773c0 .382-.311.693-.693.693zm-11.046 0c-.382 0-.693-.311-.693-.693V8.875c0-.382.311-.693.693-.693.383 0 .693.311.693.693v5.773c0 .382-.31.693-.693.693zM8.22 3.136l-.96-.96a.347.347 0 0 0-.49.49l1.02 1.02A5.535 5.535 0 0 0 6.41 6.75h11.18A5.535 5.535 0 0 0 16.21 3.686l1.02-1.02a.347.347 0 0 0-.49-.49l-.96.96A5.504 5.504 0 0 0 12 2a5.504 5.504 0 0 0-3.78 1.136zM10.04 5.25a.46.46 0 1 1 0-.92.46.46 0 0 1 0 .92zm3.92 0a.46.46 0 1 1 0-.92.46.46 0 0 1 0 .92zM6.41 7.444v8.648a1.5 1.5 0 0 0 1.5 1.5h.59v2.66a.923.923 0 1 0 1.846 0v-2.66h3.308v2.66a.923.923 0 1 0 1.846 0v-2.66h.59a1.5 1.5 0 0 0 1.5-1.5V7.444H6.41z"/>
    </svg>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleComingSoon() {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setShowToast(true);
    toastTimer.current = setTimeout(() => setShowToast(false), 2000);
  }

  return (
    <section className="relative overflow-hidden bg-white pt-4 pb-0">
      {/* "Coming soon" toast */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0f1923] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg pointer-events-none select-none">
          coming soon
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-5">
        {/* Desktop: two-column grid. Mobile: single column with phone first */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8">

          {/* MOBILE-ONLY: Phone visual (shown before headline on mobile) */}
          <div className="block md:hidden relative w-full mt-2 mb-4">
            <div
              className="relative mx-auto overflow-hidden rounded-[28px]"
              style={{
                background: "linear-gradient(244.609deg, rgb(200,224,243) 0%, rgb(211,235,231) 100%)",
                maxWidth: "100%",
                paddingTop: "12px",
              }}
            >
              <img
                src={imgPhone}
                alt="Buffer App"
                className="block mx-auto"
                style={{
                  width: "65%",
                  maxWidth: "260px",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* LEFT on desktop / below phone on mobile: heading + buttons */}
          <div className="space-y-4 md:space-y-6 pt-1 md:pt-8 lg:pt-10 pb-6 md:pb-12 lg:pb-20">
            {/* QR Code — hidden on mobile */}
            <svg className="hidden md:block" width="117" height="117" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="117" height="117" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
              <rect x="10" y="10" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="16" y="16" width="18" height="18" rx="1" fill="white"/>
              <rect x="20" y="20" width="10" height="10" rx="1" fill="#111827"/>
              <rect x="77" y="10" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="83" y="16" width="18" height="18" rx="1" fill="white"/>
              <rect x="87" y="20" width="10" height="10" rx="1" fill="#111827"/>
              <rect x="10" y="77" width="30" height="30" rx="2" fill="#111827"/>
              <rect x="16" y="83" width="18" height="18" rx="1" fill="white"/>
              <rect x="20" y="87" width="10" height="10" rx="1" fill="#111827"/>
              <rect x="48" y="10" width="6" height="6" fill="#111827"/>
              <rect x="57" y="10" width="6" height="6" fill="#111827"/>
              <rect x="48" y="20" width="6" height="6" fill="#111827"/>
              <rect x="57" y="20" width="6" height="6" fill="#111827"/>
              <rect x="48" y="30" width="6" height="6" fill="#111827"/>
              <rect x="10" y="48" width="6" height="6" fill="#111827"/>
              <rect x="20" y="48" width="6" height="6" fill="#111827"/>
              <rect x="30" y="48" width="6" height="6" fill="#111827"/>
              <rect x="48" y="48" width="6" height="6" fill="#111827"/>
              <rect x="57" y="48" width="6" height="6" fill="#111827"/>
              <rect x="66" y="48" width="6" height="6" fill="#111827"/>
              <rect x="77" y="48" width="6" height="6" fill="#111827"/>
              <rect x="87" y="48" width="6" height="6" fill="#111827"/>
              <rect x="101" y="48" width="6" height="6" fill="#111827"/>
              <rect x="48" y="57" width="6" height="6" fill="#111827"/>
              <rect x="66" y="57" width="6" height="6" fill="#111827"/>
              <rect x="87" y="57" width="6" height="6" fill="#111827"/>
              <rect x="101" y="57" width="6" height="6" fill="#111827"/>
              <rect x="57" y="66" width="6" height="6" fill="#111827"/>
              <rect x="77" y="66" width="6" height="6" fill="#111827"/>
              <rect x="101" y="66" width="6" height="6" fill="#111827"/>
              <rect x="48" y="77" width="6" height="6" fill="#111827"/>
              <rect x="66" y="77" width="6" height="6" fill="#111827"/>
              <rect x="77" y="87" width="6" height="6" fill="#111827"/>
              <rect x="87" y="87" width="6" height="6" fill="#111827"/>
              <rect x="101" y="77" width="6" height="6" fill="#111827"/>
              <rect x="48" y="87" width="6" height="6" fill="#111827"/>
              <rect x="57" y="101" width="6" height="6" fill="#111827"/>
              <rect x="77" y="101" width="6" height="6" fill="#111827"/>
              <rect x="87" y="101" width="6" height="6" fill="#111827"/>
              <rect x="101" y="101" width="6" height="6" fill="#111827"/>
            </svg>

            <h1 className="text-[36px] md:text-[44px] lg:text-[52px] font-bold leading-[1.05] md:leading-[1.08] tracking-[-0.03em] max-w-[640px]">
              Buffer turns high-interest credit card balances into one simpler payoff plan, helping you stay current, reduce debt faster, lower interest costs, and move toward becoming debt-free.
            </h1>

            {/* CTAs: primary Web button + compact iOS/Android icons inline */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate('/onboarding')}
                className="border border-black text-black flex-1 md:flex-none px-5 py-3 md:py-3 rounded-[14px] md:rounded-[8px] hover:bg-gray-50 transition text-[15px] md:text-[17px] font-medium whitespace-nowrap">
                See my rate
              </button>

              {/* iOS icon */}
              <button
                onClick={handleComingSoon}
                title="iOS – coming soon"
                aria-label="iOS – coming soon"
                className="w-11 h-11 flex items-center justify-center rounded-[10px] md:rounded-[8px] bg-[#081419] text-white hover:bg-gray-800 active:scale-95 transition flex-shrink-0"
              >
                <img src={imgAppleIcon} alt="iOS" className="w-5 h-5" />
              </button>

              {/* Android icon */}
              <button
                onClick={handleComingSoon}
                title="Android – coming soon"
                aria-label="Android – coming soon"
                className="w-11 h-11 flex items-center justify-center rounded-[10px] md:rounded-[8px] bg-[#081419] text-white hover:bg-gray-800 active:scale-95 transition flex-shrink-0"
              >
                <AndroidIcon />
              </button>
            </div>
          </div>

          {/* RIGHT: Phone — desktop only */}
          <div className="hidden md:block relative" style={{ minHeight: "460px" }}>
            <div
              className="absolute inset-x-0 bottom-0 rounded-3xl"
              style={{
                background: "linear-gradient(244.609deg, rgb(200,224,243) 0%, rgb(211,235,231) 100%)",
                height: "360px",
              }}
            />
            <img
              src={imgPhone}
              alt="Buffer App"
              style={{
                position: "absolute",
                bottom: "0",
                right: "-40px",
                height: "clamp(400px, 42vw, 520px)",
                width: "auto",
                maxWidth: "none",
                zIndex: 10,
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
