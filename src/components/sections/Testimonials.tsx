
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  { quote: "I felt lighter after just one call. Someone finally understood without trying to fix me.", meta: "After relationship conflict", emoji: "😌" },
  { quote: "Someone was finally 100% on my side. No judgment, just pure validation.", meta: "After workplace criticism", emoji: "🥺", featured: true },
  { quote: "Instant reassurance that I wasn't alone. Worth every penny for my peace of mind.", meta: "During family stress", emoji: "😊" },
  { quote: "Affordable, discreet, and genuinely human. This service is a lifesaver.", meta: "Regular user", emoji: "🙂" },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Real stories, real validation
          </h2>
          <p className="text-center text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            See how a simple conversation changed everything
          </p>
        </div>
        
        {/* Enhanced container with improved spacing */}
        <div className="relative">
          <div className="flex md:grid md:grid-cols-4 gap-6 md:gap-8 overflow-x-auto scrollbar-hide snap-x md:snap-none pb-8 md:pb-0 px-2">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[280px] max-w-[320px] shrink-0 snap-center hover:-translate-y-2 p-6 border border-gray-100 relative overflow-hidden group",
                  t.featured && "border-2 border-blue-500 shadow-xl"
                )}
              >
                {/* Gradient background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-100 to-orange-100 rounded-full translate-y-8 -translate-x-8 opacity-20"></div>
                
                {/* Featured badge */}
                {t.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg">
                      ✨ Most helpful
                    </span>
                  </div>
                )}
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Rating stars with enhanced styling */}
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 text-lg">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500 font-medium">5/5</span>
                  </div>
                  
                  {/* Quote with enhanced typography */}
                  <blockquote className="italic mb-6 text-gray-700 leading-relaxed text-base relative">
                    <span className="absolute -top-2 -left-2 text-4xl text-blue-200 opacity-60">"</span>
                    {t.quote}
                    <span className="absolute -bottom-2 -right-2 text-4xl text-blue-200 opacity-60">"</span>
                  </blockquote>
                  
                  {/* User info with emoji avatar */}
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl shadow-md border-2 border-white">
                        {t.emoji}
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 blur-sm"></div>
                    </div>
                    <div className="flex-1">
                      <strong className="block text-gray-800 font-semibold text-sm">
                        Anonymous user
                      </strong>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <small className="text-gray-500 text-xs font-medium">{t.meta}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
