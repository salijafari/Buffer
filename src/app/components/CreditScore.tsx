import imgPhone from "@/assets/78418ac86a25c5da27de25e83deb68698e0d42f2.png";

export function CreditScore() {
  return (
    <section className="py-16 md:py-24 bg-[#e8f2f8]">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img src={imgPhone} alt="Credit Score" className="w-full max-w-md mx-auto" />
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Spend less on interest. Finish sooner.
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Buffer's lower rates mean you keep thousands that would have gone to your bank — and reach debt-free years ahead of schedule.
            </p>
            <div className="pt-4">
              <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
                Get started
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
