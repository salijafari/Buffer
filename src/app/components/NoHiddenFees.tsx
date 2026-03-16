export function NoHiddenFees() {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div
          className="rounded-3xl text-white text-center py-20 px-8"
          style={{ background: "linear-gradient(-40deg, rgb(18,175,227) 0%, rgb(55,184,132) 90%)" }}
        >
          <h2 className="font-bold leading-none mb-4" style={{ fontSize: "clamp(80px, 12vw, 120px)" }}>
            $0
          </h2>
          <p className="text-4xl md:text-5xl font-bold">No Hidden Fees</p>
        </div>
      </div>
    </section>
  );
}
