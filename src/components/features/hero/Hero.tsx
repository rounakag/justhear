// src/components/features/hero/Hero.tsx


export const Hero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Talk anonymously with trained listeners who understand
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sometimes you don't need to be "fixed" or analyzed. You just need someone to say:
            <span className="italic font-medium"> "Your feelings make complete sense."</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors">
              Start Talking Now
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg text-lg transition-colors">
              Learn More
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center space-x-8 text-sm text-gray-600 mb-16">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              100% Anonymous
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Trained Listeners
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Available 24/7
            </span>
          </div>

          {/* Testimonial */}
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <blockquote className="text-lg text-gray-700 italic mb-4">
              "See how a simple conversation changed everything. For the first time in months, 
              someone actually listened without trying to fix me."
            </blockquote>
            <cite className="text-sm text-gray-500 font-medium">— Anonymous User</cite>
          </div>
        </div>
      </div>
    </section>
  )
}
// Placeholder for Hero.tsx
