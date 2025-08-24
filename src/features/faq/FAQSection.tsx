import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { FAQItem } from '@/types';

interface FAQSectionProps {
  title: string;
  faqs: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  faqs,
}) => {
  return (
    <section id="faq" className="py-10 md:py-20 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
          {title}
        </h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              value={`item-${index}`} 
              key={faq.id || index} 
              className="bg-gray-50 rounded-2xl px-6 border-0"
            >
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline hover:text-blue-600">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
