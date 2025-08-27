import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useDynamicContent } from '@/hooks/useDynamicContent';
import { useMultiEntryCMS } from '@/hooks/useMultiEntryCMS';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface FAQSectionCMSProps {
  /* No props needed - uses CMS data only */
}

export const FAQSectionCMS: React.FC<FAQSectionCMSProps> = () => {
  const { getContent } = useDynamicContent();
  const { items: faqs, loading, error } = useMultiEntryCMS('faq');

  // Get title from CMS
  const faqTitle = getContent('faq', 'title', 'Frequently Asked Questions');

  if (loading) {
    return (
      <section id="faq" className="py-10 md:py-20 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading FAQ...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="faq" className="py-10 md:py-20 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center">
            <p className="text-red-600">Failed to load FAQ</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-10 md:py-20 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
          {faqTitle}
        </h2>
        {faqs.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                value={`item-${index}`} 
                key={faq.id || index} 
                className="bg-gray-50 rounded-2xl px-6 border-0"
              >
                <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-gray-500">
            <p>No FAQ items available</p>
          </div>
        )}
      </div>
    </section>
  );
};
