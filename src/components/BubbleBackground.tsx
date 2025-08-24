

export function BubbleBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Wave animations */}
      <div className="absolute inset-0">
        <div className="wave wave-1 absolute w-full h-full bg-gradient-to-r from-cyan-200/25 via-blue-200/20 to-indigo-200/25 animate-wave-slow"></div>
        <div className="wave wave-2 absolute w-full h-full bg-gradient-to-r from-purple-200/20 via-violet-200/15 to-pink-200/20 animate-wave-medium"></div>
        <div className="wave wave-3 absolute w-full h-full bg-gradient-to-r from-emerald-200/15 via-teal-200/10 to-cyan-200/15 animate-wave-fast"></div>
      </div>

      {/* Large floating bubbles with enhanced positioning */}
      <div className="absolute inset-0">
        <div className="bubble-1 absolute w-32 h-32 bg-gradient-to-br from-white/30 to-blue-100/20 rounded-full blur-sm animate-float-slow shadow-lg"></div>
        <div className="bubble-2 absolute w-24 h-24 bg-gradient-to-br from-cyan-200/40 to-blue-200/30 rounded-full blur-sm animate-float-medium shadow-lg"></div>
        <div className="bubble-3 absolute w-40 h-40 bg-gradient-to-br from-purple-200/35 to-violet-200/25 rounded-full blur-sm animate-float-fast shadow-lg"></div>
        <div className="bubble-4 absolute w-20 h-20 bg-gradient-to-br from-emerald-200/45 to-teal-200/35 rounded-full blur-sm animate-float-slow shadow-lg"></div>
        <div className="bubble-5 absolute w-36 h-36 bg-gradient-to-br from-pink-200/40 to-rose-200/30 rounded-full blur-sm animate-float-medium shadow-lg"></div>
        <div className="bubble-6 absolute w-28 h-28 bg-gradient-to-br from-indigo-200/35 to-blue-200/25 rounded-full blur-sm animate-float-fast shadow-lg"></div>
        <div className="bubble-7 absolute w-44 h-44 bg-gradient-to-br from-cyan-200/30 to-sky-200/20 rounded-full blur-sm animate-float-slow shadow-lg"></div>
        <div className="bubble-8 absolute w-16 h-16 bg-gradient-to-br from-orange-200/40 to-amber-200/30 rounded-full blur-sm animate-float-medium shadow-lg"></div>
      </div>
      
      {/* Medium bubbles */}
      <div className="absolute inset-0">
        <div className="bubble-medium-1 absolute w-12 h-12 bg-gradient-to-br from-white/40 to-gray-100/30 rounded-full blur-sm animate-float-medium shadow-md"></div>
        <div className="bubble-medium-2 absolute w-14 h-14 bg-gradient-to-br from-cyan-300/35 to-blue-300/25 rounded-full blur-sm animate-float-slow shadow-md"></div>
        <div className="bubble-medium-3 absolute w-10 h-10 bg-gradient-to-br from-purple-300/40 to-violet-300/30 rounded-full blur-sm animate-float-fast shadow-md"></div>
        <div className="bubble-medium-4 absolute w-18 h-18 bg-gradient-to-br from-emerald-300/30 to-teal-300/20 rounded-full blur-sm animate-float-medium shadow-md"></div>
        <div className="bubble-medium-5 absolute w-8 h-8 bg-gradient-to-br from-pink-300/45 to-rose-300/35 rounded-full blur-sm animate-float-slow shadow-md"></div>
      </div>
      
      {/* Small decorative bubbles with enhanced animation */}
      <div className="absolute inset-0">
        <div className="bubble-small-1 absolute w-4 h-4 bg-gradient-to-br from-white/60 to-gray-100/50 rounded-full animate-pulse shadow-sm"></div>
        <div className="bubble-small-2 absolute w-6 h-6 bg-gradient-to-br from-cyan-400/50 to-blue-400/40 rounded-full animate-pulse delay-1000 shadow-sm"></div>
        <div className="bubble-small-3 absolute w-3 h-3 bg-gradient-to-br from-purple-400/55 to-violet-400/45 rounded-full animate-pulse delay-2000 shadow-sm"></div>
        <div className="bubble-small-4 absolute w-5 h-5 bg-gradient-to-br from-emerald-400/50 to-teal-400/40 rounded-full animate-pulse delay-1500 shadow-sm"></div>
        <div className="bubble-small-5 absolute w-4 h-4 bg-gradient-to-br from-pink-400/55 to-rose-400/45 rounded-full animate-pulse delay-500 shadow-sm"></div>
        <div className="bubble-small-6 absolute w-3 h-3 bg-gradient-to-br from-cyan-400/45 to-sky-400/35 rounded-full animate-pulse delay-3000 shadow-sm"></div>
        <div className="bubble-small-7 absolute w-5 h-5 bg-gradient-to-br from-orange-400/50 to-amber-400/40 rounded-full animate-pulse delay-2500 shadow-sm"></div>
        <div className="bubble-small-8 absolute w-4 h-4 bg-gradient-to-br from-indigo-400/50 to-blue-400/40 rounded-full animate-pulse delay-1800 shadow-sm"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="particle-1 absolute w-2 h-2 bg-white/40 rounded-full animate-float-fast"></div>
        <div className="particle-2 absolute w-1 h-1 bg-blue-400/50 rounded-full animate-float-slow"></div>
        <div className="particle-3 absolute w-2 h-2 bg-purple-400/35 rounded-full animate-float-medium"></div>
        <div className="particle-4 absolute w-1 h-1 bg-yellow-400/45 rounded-full animate-float-fast"></div>
        <div className="particle-5 absolute w-2 h-2 bg-pink-400/30 rounded-full animate-float-slow"></div>
        <div className="particle-6 absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-float-medium"></div>
      </div>
      
      {/* Gradient overlay for depth and soothing effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-transparent to-blue-50/3"></div>
    </div>
  );
}
