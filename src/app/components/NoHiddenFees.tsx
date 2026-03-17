export function NoHiddenFees() {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div
          className="rounded-3xl text-white"
          style={{
            background: "linear-gradient(-40deg, rgb(18,175,227) 0%, rgb(55,184,132) 90%)",
            padding: "clamp(32px, 8vw, 80px) clamp(24px, 8vw, 80px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            minHeight: "320px",
          }}
        >
          <h2
            className="font-extrabold leading-none"
            style={{ fontSize: "clamp(72px, 12vw, 150px)", lineHeight: 1 }}
          >
            $0
          </h2>
          <p
            className="font-semibold"
            style={{ fontSize: "clamp(28px, 4vw, 52px)", marginTop: "20px" }}
          >
            No Hidden Fees
          </p>
        </div>
      </div>
    </section>
  );
}
