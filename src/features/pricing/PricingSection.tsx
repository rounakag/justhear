import React from 'react';
import { Card, Badge } from '@/design-system/components';
import { Button } from '@/design-system/components';
import { SchedulerModal } from '@/components/SchedulerModal';
import type { AppConfig } from '@/types';
import { cn } from '@/lib/utils';

interface PricingSectionProps {
  title: string;
  config: AppConfig;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  title,
  config,
}) => {
  return (
    <section id="pricing" className="py-12 md:py-20 bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 md:mb-10 text-gray-800">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PricingCard
            title="Per Session"
            originalPrice={config.pricing.originalPrice}
            currentPrice={config.pricing.perSessionPrice}
            duration={config.pricing.sessionDuration}
            description={`${config.pricing.sessionDuration} minutes of validation`}
            isPopular={true}
            isAvailable={true}
          />
          <PricingCard
            title="Monthly Package"
            originalPrice={0}
            currentPrice={0}
            duration={0}
            description="15 sessions per month"
            isPopular={false}
            isAvailable={false}
            comingSoon={true}
          />
        </div>
      </div>
    </section>
  );
};

interface PricingCardProps {
  title: string;
  originalPrice: number;
  currentPrice: number;
  duration: number;
  description: string;
  isPopular: boolean;
  isAvailable: boolean;
  comingSoon?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  originalPrice,
  currentPrice,
  _duration,
  description,
  isPopular,
  isAvailable,
  comingSoon = false,
}) => {
  return (
    <Card
      className={cn(
        "text-center relative border-2",
        isPopular
          ? "border-blue-500 shadow-lg md:transform md:scale-105"
          : "border-gray-200 opacity-60"
      )}
    >
      {isPopular && (
        <Badge
          variant="info"
          className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 md:px-6 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold"
        >
          Most Popular
        </Badge>
      )}
      
      <h3 className="font-bold mb-3 md:mb-4 text-lg md:text-xl text-gray-800">
        {title}
      </h3>
      
      {comingSoon ? (
        <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-3 md:mb-4">
          Coming Soon
        </div>
      ) : (
        <>
          <div className="text-base md:text-lg line-through text-gray-400 mb-1 md:mb-2">
            ₹{originalPrice}
          </div>
          <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-3 md:mb-4">
            ₹{currentPrice}
          </div>
        </>
      )}
      
      <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
        {description}
      </p>
      
      {isAvailable ? (
        <SchedulerModal>
          <Button className="w-full rounded-lg text-sm md:text-base py-2 md:py-3">
            Book Session
          </Button>
        </SchedulerModal>
      ) : (
        <Button disabled className="w-full rounded-lg text-sm md:text-base py-2 md:py-3">
          Coming Soon
        </Button>
      )}
    </Card>
  );
};
