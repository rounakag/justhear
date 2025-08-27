
import { useReachOut } from "@/hooks/useReachOut";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ReachOutProps {
  /* No props needed - uses CMS data only */
}

/**
 * Radial desktop layout + horizontal-scroll mobile layout.
 * • Any number of feelings is automatically spaced around a circle.
 * • Centre badge stays in the middle.
 */
export const ReachOut = ({}: ReachOutProps) => {
  const { items, loading, error } = useReachOut();
  const { getContent } = useDynamicContent();
  
  // Get central card text from CMS
  const centralCardText = getContent('examples', 'central_card_text') || 'You Need Validation';
  
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
    <div className="relative w-[420px] h-[420px] mx-auto hidden md:block">
      {/* centre badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-purple-600 text-white
                        flex items-center justify-center text-center
                        text-sm font-semibold px-2">
          {centralCardText.split(' ').map((word, i) => (
            <span key={i}>{word}<br/></span>
          ))}
        </div>
      </div>

      {/* orbiting cards */}
      {data.map((f, i) => {
        const angle = (360 / data.length) * i;          // deg
        const r     = 160;                               // radius
        const rad   = angle * Math.PI / 180;             // deg→rad
        const x     = 210 + r * Math.cos(rad) - 70;      // 70 = half card-width
        const y     = 210 + r * Math.sin(rad) - 60;      // 60 = half card-height

        return (
          <div
            key={i}
            className="absolute w-36 px-3 py-4 bg-white rounded-xl shadow
                       text-center text-gray-700 select-none
                       hover:-translate-y-1 transition"
            style={{ top:y, left:x }}
          >
            <div className="text-2xl mb-1">{f.emoji}</div>
            <span className="text-xs italic">“{f.text}”</span>
          </div>
        );
      })}
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
