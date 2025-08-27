
import { useReachOut } from "@/hooks/useReachOut";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ReachOutProps {
  /* No props needed - uses CMS data only */
}

/**
 * Service-focused cards that directly connect to listening service.
 * • Clear value propositions for each scenario.
 * • Professional yet empathetic design with better visual hierarchy.
 * • Encourages users to book sessions when they need support.
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
    <div className="relative w-full max-w-7xl mx-auto hidden md:block">
      {/* Service-focused grid layout */}
      <div className="grid grid-cols-3 gap-8 px-8">
        {data.map((f, i) => {
          // Very light gradient colors
          const gradients = [
            'from-blue-50 to-blue-50/80',
            'from-purple-50 to-purple-50/80', 
            'from-emerald-50 to-emerald-50/80',
            'from-amber-50 to-amber-50/80',
            'from-rose-50 to-rose-50/80',
            'from-violet-50 to-violet-50/80'
          ];
          const gradient = gradients[i % gradients.length];
          
          return (
            <div
              key={i}
              className="relative group"
            >
              {/* Service-focused Card */}
              <div className={`w-full bg-gradient-to-br ${gradient} 
                             backdrop-blur-sm bg-white/90 rounded-3xl shadow-lg
                             text-center text-gray-700 select-none
                             hover:-translate-y-2 hover:scale-102 hover:shadow-xl 
                             transition-all duration-300 ease-out
                             border border-white/80 relative overflow-hidden
                             group-hover:border-blue-200/60`}>
                
                              {/* Removed corner bubbles for cleaner design */}
                
                {/* Card content */}
                <div className="relative z-10 px-6 py-8">
                  {/* Smaller emoji */}
                  <div className="text-4xl mb-4 drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {f.emoji}
                  </div>
                  
                  {/* Larger content text */}
                  <div className="space-y-2">
                    <p className="text-base leading-relaxed text-gray-700 font-medium">
                      {f.text}
                    </p>
                  </div>
                </div>
                
                {/* Very subtle border glow on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-300/10 via-purple-300/10 to-pink-300/10 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* -----  MOBILE (<md)  ----- */
  const mobile = (
    <div className="md:hidden flex gap-6 overflow-x-auto py-6 px-4
                    snap-x scrollbar-hide">
      {data.map((f,i) => {
        // Very light gradient colors for mobile
        const gradients = [
          'from-blue-50 to-blue-50/80',
          'from-purple-50 to-purple-50/80', 
          'from-emerald-50 to-emerald-50/80',
          'from-amber-50 to-amber-50/80',
          'from-rose-50 to-rose-50/80',
          'from-violet-50 to-violet-50/80'
        ];
        const gradient = gradients[i % gradients.length];
        
        return (
          <div key={i}
               className={`snap-center flex-shrink-0 w-64 bg-gradient-to-br ${gradient} 
                          backdrop-blur-sm bg-white/90 rounded-3xl shadow-lg
                          px-6 py-8 text-center text-gray-700
                          hover:-translate-y-2 hover:scale-102 hover:shadow-xl 
                          transition-all duration-300 ease-out
                          border border-white/80 relative overflow-hidden group`}>
            
            {/* Removed corner bubbles for cleaner mobile design */}
            
            {/* Card content */}
            <div className="relative z-10">
              <div className="text-4xl mb-4 drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
                {f.emoji}
              </div>
              
              {/* Larger content text for mobile */}
              <div className="space-y-2">
                <p className="text-base leading-relaxed text-gray-700 font-medium">
                  {f.text}
                </p>
              </div>
            </div>
            
            {/* Very subtle border glow for mobile */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-300/10 via-purple-300/10 to-pink-300/10 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
