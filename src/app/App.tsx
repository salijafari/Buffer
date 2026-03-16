import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CreditScore } from './components/CreditScore';
import { PersonalManager } from './components/PersonalManager';
import { NoHiddenFees } from './components/NoHiddenFees';
import { LateProtection } from './components/LateProtection';
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
        <Features />
        <CreditScore />
        <PersonalManager />
        <NoHiddenFees />
        <LateProtection />
        <HowItWorks />
        <Comparison />
        <FAQ />
        <JoinNow />
      </main>
      <Footer />
    </div>
  );
}
