
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/features/hero/HeroSection';
import { TestimonialsSection } from '@/features/testimonials/TestimonialsSection';
import { ExamplesSection } from '@/features/examples/ExamplesSection';
import { FeaturesSection } from '@/features/features/FeaturesSection';
import { ComparisonSection } from '@/features/comparison/ComparisonSection';
import { ScienceSection } from '@/features/science/ScienceSection';
import { PricingSection } from '@/features/pricing/PricingSection';
import { FAQSection } from '@/features/faq/FAQSection';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { UserDashboardPage } from '@/pages/UserDashboardPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { config } from '@/config/environment';
import {
  NAV_LINKS,
  TESTIMONIALS,
  EXAMPLES,
  FEATURES,
  DIFFERENT,
  SCIENCE,
  FAQ,
} from '@/constants/data';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={
              <div className="font-sans min-h-screen bg-neutral-50">
                <Header navLinks={NAV_LINKS} config={config} />
                
                {/* Hero Section */}
                <HeroSection
                  title="Feeling"
                  subtitle="upset?"
                  description="We're here to listen."
                  ctaText="Book Session"
                  secondaryCtaText="See How It Works"
                  secondaryCtaHref="#how"
                />

                {/* Testimonials Section */}
                <TestimonialsSection
                  title="Real stories, real validation"
                  subtitle="See how a simple conversation changed everything"
                  testimonials={TESTIMONIALS}
                />

                {/* Examples Section */}
                <ExamplesSection
                  title="Reach out to us, when u feel"
                  examples={EXAMPLES}
                />

                {/* Features Section */}
                <FeaturesSection
                  title="How it works"
                  features={FEATURES}
                />

                {/* Comparison Section */}
                <ComparisonSection
                  title="We're not therapy — we're something different"
                  subtitle="Sometimes you don't need to be fixed or analyzed. You just need someone to say: Your feelings make complete sense."
                  items={DIFFERENT}
                  config={config}
                />

                {/* Science Section */}
                <ScienceSection
                  title="Why validation works"
                  items={SCIENCE}
                />

                {/* Pricing Section */}
                <PricingSection
                  title="Choose your plan"
                  config={config}
                />

                {/* FAQ Section */}
                <FAQSection
                  title="Frequently Asked Questions"
                  faqs={FAQ}
                />

                {/* Footer */}
                <Footer config={config} />
              </div>
            } />

            {/* Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* User Pages */}
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />
            
            {/* Admin Pages */}
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
