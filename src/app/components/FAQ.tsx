import { useState } from "react";

const faqs = [
  {
    question: "Is Buffer safe to use?",
    answer:
      "Yes, Buffer uses bank-level security with 256-bit encryption to protect your data. We're regulated by federal and provincial authorities and your information is never shared without your permission.",
  },
  {
    question: "How does Buffer affect my credit score?",
    answer:
      "Buffer can help improve your credit score by reducing your credit utilization ratio and ensuring on-time payments. Most users see their credit score improve within the first few months.",
  },
  {
    question: "I'm having trouble with the app. What should I do?",
    answer:
      "Contact our support team at hello@mybuffer.ca or through the in-app chat feature. We're here to help 24/7.",
  },
  {
    question: "Who is Buffer designed for?",
    answer:
      "Buffer is ideal for anyone with credit card debt who wants to save money on interest, improve their credit score, and pay off debt faster.",
  },
  {
    question: "What are the requirements to join Buffer?",
    answer:
      "You need to be 18 or older, have a steady income, a valid bank account, and a credit score of at least 600 to qualify.",
  },
  {
    question: "Is Buffer a bank?",
    answer:
      "No, Buffer is not a bank. We're a financial technology company that partners with banks to offer credit lines.",
  },
  {
    question: "How does Buffer make money?",
    answer:
      "Buffer makes money from the interest on credit lines we provide. We keep our rates low and transparent with no hidden fees.",
  },
  {
    question: "Is Buffer available in my province?",
    answer:
      "Buffer is available in most provinces. Check our website or app for the most current list of supported provinces.",
  },
  {
    question: "Is Buffer a debt consolidation service?",
    answer:
      "Buffer offers balance transfer credit lines that can help consolidate multiple credit card debts into one lower-rate payment.",
  },
  {
    question: "How do I close my account?",
    answer:
      "You can close your account through the app settings or by contacting our support team at hello@mybuffer.ca.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-12 bg-white">
      <div className="container mx-auto max-w-4xl px-5">
        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-50 transition px-2"
              >
                <span className="text-[22px] font-bold text-black pr-6">
                  {faq.question}
                </span>
                <span
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-2xl font-light transition-transform select-none"
                  style={{ transform: openIndex === i ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </button>

              {openIndex === i && (
                <div className="px-2 pb-6">
                  <p className="text-[17px] text-gray-700 leading-[27px]">
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
