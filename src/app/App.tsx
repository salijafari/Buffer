import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Partners } from './components/Partners';
import { PayLessSection } from './components/PayLessSection';
import { Features } from './components/Features';
import { CreditScore } from './components/CreditScore';
import { NoHiddenFees } from './components/NoHiddenFees';
import { LateProtection } from './components/LateProtection';
import { PersonalManager } from './components/PersonalManager';
import { HowItWorks } from './components/HowItWorks';
import { Comparison } from './components/Comparison';
import { FAQ } from './components/FAQ';
import { JoinNow } from './components/JoinNow';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <Partners />
        <PayLessSection />
        <Features />
        <CreditScore />
        <NoHiddenFees />
        <LateProtection />
        <PersonalManager />
        <HowItWorks />
        <Comparison />
        <FAQ />
        <JoinNow />
      </main>
      <Footer />
    </div>
  );
}
