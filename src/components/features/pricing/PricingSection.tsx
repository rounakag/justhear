// Placeholder for PricingSection.tsx
// src/components/features/pricing/PricingSection.tsx


export const PricingSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Support Level
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with what feels right. You can always upgrade as your needs grow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h3 className="text-2xl font-semibold mb-4">Basic Support</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">$29</span>
              <span className="text-gray-600 ml-2">/session</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">✓</span>
                30 minutes of validation
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">✓</span>
                Available 24/7
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">✓</span>
                Anonymous conversations
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">✓</span>
                Trained listeners
              </li>
            </ul>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors">
              Get Started
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <h3 className="text-2xl font-semibold mb-4">Premium Care</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">$79</span>
              <span className="text-gray-600 ml-2">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">✓</span>
                15 sessions per month
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">✓</span>
                Priority matching
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">✓</span>
                Extended 45-minute sessions
              </li>
              <li className="flex items-center">
                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">✓</span>
                Specialized listeners
              </li>
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
              Start Premium
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
