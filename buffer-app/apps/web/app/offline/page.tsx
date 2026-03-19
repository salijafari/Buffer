export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-6 text-center gap-5">
      <span className="text-6xl" aria-hidden="true">📡</span>
      <div>
        <h1 className="text-white text-2xl font-bold mb-2">You&apos;re offline</h1>
        <p className="text-[#8B9CB6] text-sm leading-relaxed max-w-xs">
          No internet connection detected. Connect to Wi-Fi or cellular and try again. Your data is safe.
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="bg-[#00C9A7] text-[#0F1117] font-semibold text-sm rounded-xl px-8 py-3 hover:bg-[#00B496] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C9A7]"
      >
        Try Again
      </button>
    </div>
  );
}
