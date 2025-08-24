
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  { quote: "I felt lighter after just one call. Someone finally understood without trying to fix me.", meta: "After relationship conflict", emoji: "😌" },
  { quote: "Someone was finally 100% on my side. No judgment, just pure validation.", meta: "After workplace criticism", emoji: "🥺", featured: true },
  { quote: "Instant reassurance that I wasn't alone. Worth every penny for my peace of mind.", meta: "During family stress", emoji: "😊" },
  { quote: "Affordable, discreet, and genuinely human. This service is a lifesaver.", meta: "Regular user", emoji: "🙂" },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-10 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
          Real stories, real validation
        </h2>
        <p className="text-center text-gray-600 mb-6 md:mb-12 text-base md:text-lg">
          See how a simple conversation changed everything
        </p>
        
        {/* Fixed container with proper overflow handling */}
        <div className="relative">
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto scrollbar-hide snap-x md:snap-none pb-8 md:pb-0 px-2">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "bg-white rounded-2xl shadow-sm p-6 min-w-[280px] max-w-[320px] shrink-0 snap-center transition-transform hover:-translate-y-1 relative",
                  t.featured && "border-2 border-blue-500 shadow-lg"
                )}
              >
                {/* Fixed badge positioning - now outside the card flow */}
                {t.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      ✨ Most helpful
                    </span>
                  </div>
                )}
                
                <div className="text-yellow-400 mb-3 text-lg">⭐⭐⭐⭐⭐</div>
                <blockquote className="italic mb-4 text-gray-700 leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <div className="flex gap-3 items-center">
                  <span className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-100 text-xl">
                    {t.emoji}
                  </span>
                  <div>
                    <strong className="block text-gray-800">Anonymous user</strong>
                    <small className="text-gray-500">{t.meta}</small>
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
