export function Footer() {
  return (
    <footer className="bg-[#fafafa] py-12">
      <div className="container mx-auto max-w-7xl px-5">
        <div className="space-y-8">
          <div className="flex flex-wrap gap-8 text-sm font-bold opacity-50">
            <a href="#terms" className="hover:opacity-100 transition">
              Terms and Conditions
            </a>
            <a href="#privacy" className="hover:opacity-100 transition">
              Privacy Policy
            </a>
            <a href="mailto:hello@mybuffer.ca" className="hover:opacity-100 transition">
              hello@mybuffer.ca
            </a>
          </div>
          
          <div className="space-y-3 text-sm opacity-50">
            <p className="text-xs">
              <sup>1</sup> Buffer credit line APR, which is the same as interest rate, ranges from 14%–18% depending on factors including your credit profile. The rate is variable with the Bank of Canada prime rate. Most major Canadian credit cards are eligible for balance transfer once a credit line is approved.
            </p>
            <p className="text-xs">
              <sup>2</sup> For example, if your APR is 24%, total balance is $10,000, and you make fixed monthly payments of $300, your total interest until full payoff would be $6,644 — versus $2,737 with Buffer. Use the Buffer payoff calculator to see your personalized debt-free date.
            </p>
            <p className="text-xs">
              <sup>3</sup> Based on average user outcomes in 2024, measured using the Vantage 3.0 scoring model. Individual results will vary. Credit score improvement is not guaranteed. Credit scores are independently calculated by credit bureaus and reflect many factors beyond payment history alone. Your score may be affected by other financial decisions or by products and services you use with other providers.
            </p>
            
            <div className="pt-4 space-y-1">
              <p>1155 Pender St, Vancouver, BC, Canada.</p>
              <p>© 2026 Buffer. mybuffer.ca</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
