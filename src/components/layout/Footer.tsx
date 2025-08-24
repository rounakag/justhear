import React from 'react';
import type { AppConfig } from '@/types';

interface FooterProps {
  config: AppConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-8 md:py-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4 text-xl">{config.app.name}</h3>
            <p className="text-gray-300 leading-relaxed">{config.app.description}</p>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-xl">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <a href="#how" className="text-gray-300 hover:text-white transition">
                How it works
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition">
                Pricing
              </a>
              <a href="#faq" className="text-gray-300 hover:text-white transition">
                FAQ
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                Privacy Policy
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-xl">Contact</h3>
            <div className="flex flex-col gap-2">
              <a href={`tel:${config.contact.phone}`} className="text-gray-300 hover:text-white transition">
                Call: {config.contact.phone}
              </a>
              <a href={`mailto:${config.contact.email}`} className="text-gray-300 hover:text-white transition">
                {config.contact.email}
              </a>
            </div>
          </div>
        </div>
        <div className="text-center py-6 border-t border-gray-700 text-gray-400">
          © {currentYear} {config.app.name} · All rights reserved
        </div>
      </div>
    </footer>
  );
};
