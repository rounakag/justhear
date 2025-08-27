
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
          
          return (
            <div
              key={i}
              className="relative flex flex-col items-center"
              style={{ marginTop: `${height}px` }}
            >
              {/* Thread */}
              <div className="w-0.5 bg-gray-300 h-16 mb-2"></div>
              
              {/* Card */}
              <div className="w-full max-w-xs bg-white rounded-xl shadow-lg
                             text-center text-gray-700 select-none
                             hover:-translate-y-2 hover:shadow-xl transition-all duration-300
                             border border-gray-100 px-4 py-6">
                <div className="text-3xl mb-3">{f.emoji}</div>
                <span className="text-sm italic leading-relaxed">"{f.text}"</span>
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
      {data.map((f,i) => (
        <div key={i}
             className="snap-center flex-shrink-0 w-40 bg-white rounded-xl
                        shadow px-4 py-6 text-center text-gray-700
                        hover:-translate-y-1 transition">
          <div className="text-2xl mb-2">{f.emoji}</div>
          <span className="text-xs italic">“{f.text}”</span>
        </div>
      ))}
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
