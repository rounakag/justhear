
import { useReachOut } from "@/hooks/useReachOut";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ReachOutProps {
  /* Pass a custom list if you need more/other boxes */
  feelings?: any[];
}

/**
 * Radial desktop layout + horizontal-scroll mobile layout.
 * • Any number of feelings is automatically spaced around a circle.
 * • Centre badge stays in the middle.
 */
export const ReachOut = ({ feelings }: ReachOutProps) => {
  const { items, loading, error } = useReachOut();
  const { getContent } = useDynamicContent();
  
  // Get central card text from CMS
  const centralCardText = getContent('examples', 'central_card_text') || 'You Need Validation';
  
  // Debug logging
  console.log('🔍 DEBUG - useReachOut items:', items);
  console.log('🔍 DEBUG - items length:', items.length);
  
  // Use CMS data or fallback to hardcoded data
  const data = feelings ?? (items.length > 0 ? items.map(item => ({
    id: item.id,
    emoji: item.emoji,
    text: item.title,
    category: "emotion"
  })) : [
    { id: "1", emoji:"😔", text:"Nobody is mine… it's my fault.", category: "loneliness" },
    { id: "2", emoji:"🤔", text:"Am I really that wrong about everything?", category: "doubt" },
    { id: "3", emoji:"🤗", text:"I wish someone could hug me until my soul melts.", category: "comfort" },
    { id: "4", emoji:"😢", text:"Life took something that stole my smile.", category: "sadness" },
    { id: "5", emoji:"😞", text:"I no longer want to prove I'm right.", category: "resignation" },
    { id: "6", emoji:"😤", text:"Nobody apologized; they blamed me for reacting.", category: "frustration" },
  ]);

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
    // Fallback to hardcoded data on error
  }

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
};
