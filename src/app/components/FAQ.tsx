import { useState } from 'react';
import { Plus } from 'lucide-react';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is Buffer safe to use?",
      answer: "Yes, Buffer uses bank-level security with 256-bit encryption to protect your data. We're regulated by federal and provincial authorities and your information is never shared without your permission."
    },
    {
      question: "How does Buffer affect my credit score?",
      answer: "Buffer can help improve your credit score by reducing your credit utilization ratio and ensuring on-time payments. Most users see their credit score improve within the first few months."
    },
    {
      question: "I'm having trouble with the app. What should I do?",
      answer: "Contact our support team at hello@mybuffer.ca or through the in-app chat feature. We're here to help 24/7."
    },
    {
      question: "Who is Buffer designed for?",
      answer: "Buffer is ideal for anyone with credit card debt who wants to save money on interest, improve their credit score, and pay off debt faster."
    },
    {
      question: "What are the requirements to join Buffer?",
      answer: "You need to be 18 or older, have a steady income, a valid bank account, and a credit score of at least 600 to qualify."
    },
    {
      question: "Is Buffer a bank?",
      answer: "No, Buffer is not a bank. We're a financial technology company that partners with banks to offer credit lines."
    },
    {
      question: "How does Buffer make money?",
      answer: "Buffer makes money from the interest on credit lines we provide. We keep our rates low and transparent with no hidden fees."
    },
    {
      question: "Is Buffer available in my province?",
      answer: "Buffer is available in most provinces. Check our website or app for the most current list of supported provinces."
    },
    {
      question: "Is Buffer a debt consolidation service?",
      answer: "Buffer offers balance transfer credit lines that can help consolidate multiple credit card debts into one lower-rate payment."
    },
    {
      question: "How do I close my account?",
      answer: "You can close your account through the app settings or by contacting our support team at hello@mybuffer.ca."
    }
  ];

  return (
    <section id="faq" className="py-16 bg-white">
      <div className="container mx-auto max-w-4xl px-5">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#fafafa] rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 transition"
              >
                <span className="text-xl md:text-2xl font-bold pr-4">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-transform ${openIndex === index ? 'rotate-45' : ''}`}>
                  <Plus className="w-6 h-6" />
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
