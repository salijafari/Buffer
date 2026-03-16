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
            <a href="mailto:hi@gauss.money" className="hover:opacity-100 transition">
              hi@gauss.money
            </a>
          </div>
          
          <div className="space-y-3 text-sm opacity-50">
            <p className="text-xs">
              <sup>1</sup> Gauss credit line APR, which is the same as interest rate, is 14%-18%, depending on a number of factors, including credit profile. The rate is variable with prime rate. The majority of credit cards are eligible for the balance transfer if a credit line is approved.
            </p>
            <p className="text-xs">
              <sup>2</sup> For example, if user's APR is 24%, total balance is $10,000 and fixed monthly payments are $300, user's interest expense until full payoff would be $6,644 vs. $2,737 with Gauss. Use Gauss payoff calculator to estimate debt-free dates for your case.
            </p>
            <p className="text-xs">
              <sup>3</sup> Average user outcomes in 2024, based on Vantage 3.0 score. Individual results may vary. Credit score stability/improvement is not guaranteed. Credit scores are independently determined by credit bureaus, and on-time payment history is only one of many factors that such bureaus consider. Your credit score may be negatively impacted by other financial decisions you make, or by activities or services you engage in with other financial services organizations.
            </p>
            
            <div className="pt-4">
              <a href="#blog" className="text-[#00659e] hover:underline">Blog</a>
            </div>
            
            <div className="pt-4 space-y-1">
              <p>Gauss (Placid Inc.)</p>
              <p>200 Vesey Street, 24th Floor, New York, NY 10281</p>
              <p>(877) 909-1559</p>
              <p className="pt-2">NMLS ID: 2654599</p>
              <p>Copyright 2025. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
