import React from "react";

interface MaterialityLayoutProps {
  children: React.ReactNode;
}

export default function MaterialityLayout({ children }: MaterialityLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-[#f4f4f4] text-[#161616]">
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
