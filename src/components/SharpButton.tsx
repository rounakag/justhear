import React from "react";

export function SharpButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="border-2 border-blue-600 shadow-sm text-blue-600 font-semibold rounded-lg px-4 py-2 transition-colors duration-300 ease-in-out hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </button>
  );
}
