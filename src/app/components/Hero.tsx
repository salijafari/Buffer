import imgLogo from "figma:asset/a93787efbcbacc9352fdb7abdfae61bee6c09e2e.png";
import imgPhone from "figma:asset/e1c5d242b328eb754ecaa2b62f529e67177aed6f.png";
import imgAppleIcon from "figma:asset/9bacaaf934ba616b78ec2d4b9d012296ff799217.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <img src={imgLogo} alt="Gauss Logo" className="w-[117px] h-auto" />
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Self-Improving<br />Credit
            </h1>
            
            <p className="text-lg text-gray-700 leading-relaxed max-w-md">
              Automatically improve your credit profile, lower the interest on your cards and loans, pay off debt faster, and continuously unlock more cash to spend.
            </p>
            
            <div className="space-y-4">
              <button className="flex items-center gap-3 bg-[#081419] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
                <img src={imgAppleIcon} alt="Apple" className="w-5 h-auto" />
                <span className="text-base">App Store</span>
              </button>
              
              <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
                Android
              </button>
              
              <button className="border border-black text-black px-8 py-3 rounded-lg hover:bg-gray-50 transition block w-full md:w-auto">
                Web Sign-up / Login
              </button>
            </div>
          </div>
          
          <div className="relative flex justify-center md:justify-end">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#c8e0f3] to-[#d3ebe7] p-8 md:p-12">
              <img src={imgPhone} alt="Gauss App" className="w-full max-w-[400px] h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
