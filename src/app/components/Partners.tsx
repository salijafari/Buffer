export function Partners() {
  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-10 opacity-40">

          {/* Equifax */}
          <svg height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="22" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="22" fill="#1a1a1a" letterSpacing="1">EQUIFAX</text>
          </svg>

          {/* experian */}
          <svg height="28" viewBox="0 0 110 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="22" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="20" fill="#1a1a1a">experian.</text>
          </svg>

          {/* PLAID */}
          <svg height="28" viewBox="0 0 90 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="4" width="8" height="8" fill="#1a1a1a"/>
            <rect x="10" y="0" width="8" height="8" fill="#1a1a1a"/>
            <rect x="0" y="14" width="8" height="8" fill="#1a1a1a"/>
            <rect x="10" y="10" width="8" height="8" fill="#1a1a1a"/>
            <text x="24" y="20" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="18" fill="#1a1a1a" letterSpacing="1">PLAID</text>
          </svg>

        </div>
      </div>
    </section>
  );
}
