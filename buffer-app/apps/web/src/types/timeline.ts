// Re-export types from core package for use in web app components.
// In production these come from @buffer/core; here we duplicate to avoid
// workspace: protocol issues with plain npm.

export interface SimulationResult {
  monthsToZero: number;
  totalInterest: number;
  totalPaid: number;
  balanceArray: number[];
  debtFreeDate: Date;
  monthlyPayment: number;
}

export interface TimelineOutput {
  future1: SimulationResult;
  future2: SimulationResult | null;
  future3: SimulationResult | null;
  recommendedPayment: number;
  interestSavings: number;
  yearsSaved: number;
  insufficientIncome: boolean;
  aprFallbackApplied: boolean;
  limitedHistory: boolean;
}

export interface CardData {
  id: string;
  name: string;
  last4: string;
  balance: number;
  apr: number | null;
  limit: number;
  institution: string;
  color?: string;
}

export interface CreditScore {
  score: number;
  band: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  reportDate: string;
  bureau: 'equifax' | 'transunion';
  history: { month: string; score: number }[];
}
