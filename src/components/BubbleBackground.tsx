import React from "react";

export function BubbleBackground() {
  return (
    <div className="absolute inset-0 -z-10 opacity-20">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="70" cy="390" r="40" fill="#fff" className="bubble delay-0" />
        <circle cx="160" cy="410" r="60" fill="#fff" className="bubble delay-4" />
        <circle cx="300" cy="390" r="80" fill="#fff" className="bubble delay-8" />
        <circle cx="220" cy="420" r="35" fill="#fff" className="bubble delay-12" />
        <circle cx="340" cy="410" r="50" fill="#fff" className="bubble delay-16" />
      </svg>
    </div>
  );
}
