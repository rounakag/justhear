
import { useReachOut } from "@/hooks/useReachOut";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ReachOutProps {
  /* No props needed - uses CMS data only */
}

/**
 * Hanging cards desktop layout + horizontal-scroll mobile layout.
 * • Cards hang from threads at different heights for visual interest.
 * • Grid layout adapts to number of cards.
 */
export const ReachOut = ({}: ReachOutProps) => {
  const { items, loading, error } = useReachOut();
  
  // Debug logging
  console.log('🔍 DEBUG - useReachOut items:', items);
  console.log('🔍 DEBUG - items length:', items.length);
  console.log('🔍 DEBUG - items type:', typeof items);
  
  // Use ONLY CMS data - no fallbacks
  const data = items && items.length > 0 ? items.map(item => ({
    id: item.id,
    emoji: item.emoji,
    text: item.title,
    category: "emotion"
  })) : [];
  
  console.log('🔍 DEBUG - Final data array:', data);
  console.log('🔍 DEBUG - Data length:', data.length);

  /* -----  DESKTOP (≥md)  ----- */
  const desktop = (
    <div className="relative w-full max-w-6xl mx-auto hidden md:block">
      {/* Hanging cards with threads */}
      <div className="grid grid-cols-3 gap-8 px-8">
        {data.map((f, i) => {
          // Create different heights for visual interest
          const heights = [0, -20, 20, -40, 40, -10, 30, -30];
          const height = heights[i % heights.length] || 0;
          
          // Different gradient colors for variety
          const gradients = [
            'from-blue-50 to-indigo-100',
            'from-purple-50 to-pink-100', 
            'from-emerald-50 to-teal-100',
            'from-amber-50 to-orange-100',
            'from-rose-50 to-red-100',
            'from-violet-50 to-purple-100',
            'from-cyan-50 to-blue-100',
            'from-lime-50 to-green-100'
          ];
          const gradient = gradients[i % gradients.length];
          
          return (
            <div
              key={i}
              className="relative flex flex-col items-center group"
              style={{ marginTop: `${height}px` }}
            >
              {/* Animated Thread */}
              <div className="w-0.5 bg-gradient-to-b from-gray-400 to-gray-300 h-16 mb-2 
                             group-hover:bg-gradient-to-b group-hover:from-blue-400 group-hover:to-blue-300
                             transition-all duration-500 ease-out"></div>
              
              {/* Stunning Card */}
              <div className={`w-full max-w-sm bg-gradient-to-br ${gradient} 
                             backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl
                             text-center text-gray-700 select-none
                             hover:-translate-y-3 hover:scale-105 hover:shadow-2xl 
                             transition-all duration-500 ease-out
                             border-2 border-white/60 relative overflow-hidden
                             group-hover:border-blue-300/80`}>
                
                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                               -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                {/* Card content */}
                <div className="relative z-10 px-8 py-10">
                  {/* Emoji with glow effect */}
                  <div className="text-5xl mb-5 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {f.emoji}
                  </div>
                  
                  {/* Text with enhanced styling */}
                  <span className="text-base italic leading-relaxed font-medium text-gray-600 
                                 group-hover:text-gray-800 transition-colors duration-300">
                    "{f.text}"
                  </span>
                </div>
                
                {/* Sharp border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* -----  MOBILE (<md)  ----- */
  const mobile = (
    <div className="md:hidden flex gap-4 overflow-x-auto py-4 px-2
                    snap-x scrollbar-hide">
      {data.map((f,i) => {
        // Different gradient colors for mobile cards too
        const gradients = [
          'from-blue-50 to-indigo-100',
          'from-purple-50 to-pink-100', 
          'from-emerald-50 to-teal-100',
          'from-amber-50 to-orange-100',
          'from-rose-50 to-red-100',
          'from-violet-50 to-purple-100',
          'from-cyan-50 to-blue-100',
          'from-lime-50 to-green-100'
        ];
        const gradient = gradients[i % gradients.length];
        
        return (
          <div key={i}
               className={`snap-center flex-shrink-0 w-56 bg-gradient-to-br ${gradient} 
                          backdrop-blur-sm bg-white/80 rounded-2xl shadow-xl
                          px-6 py-8 text-center text-gray-700
                          hover:-translate-y-2 hover:scale-105 hover:shadow-2xl 
                          transition-all duration-500 ease-out
                          border-2 border-white/60 relative overflow-hidden group`}>
            
            {/* Shimmer effect for mobile */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            
            {/* Card content */}
            <div className="relative z-10">
              <div className="text-4xl mb-4 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                {f.emoji}
              </div>
              <span className="text-sm italic font-medium text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                "{f.text}"
              </span>
            </div>
            
            {/* Sharp border glow for mobile */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        );
      })}
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('ReachOut component error:', error);
    return (
      <div className="text-center py-8 text-gray-500">
        Error loading content. Please try again later.
      </div>
    );
  }

  // Show message when no data
  if (!loading && data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No content available. Please add content through the admin panel.
      </div>
    );
  }

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
};
