import imgPhone from "@/assets/0f784c2fc0dce30be8a6e9bc1cecd721a09cac2b.png";

export function PersonalManager() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="bg-[#fafafa] rounded-3xl p-8 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Personal Credit Manager
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Get expert guidance and personalized recommendations to optimize your credit strategy and reach your financial goals faster.
              </p>
              <div className="pt-4">
                <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
                  Learn more
                </button>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <img src={imgPhone} alt="Personal Manager" className="w-full max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
