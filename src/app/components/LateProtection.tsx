import imgPhone from "figma:asset/4e1733ab90be924b3a8d9c276e1ff5feae8b6bfe.png";

export function LateProtection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="bg-[#fafafa] rounded-3xl p-8 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img src={imgPhone} alt="Late Fee Protection" className="w-full max-w-md mx-auto" />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Late Fee Protection
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Never worry about late fees again. Gauss automatically monitors your payment schedule and alerts you before any payment is due.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#1ba19c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Automatic payment reminders</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#1ba19c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Smart scheduling to avoid late fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#1ba19c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Protection from penalty APR increases</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
