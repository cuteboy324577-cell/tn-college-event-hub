import React, { useEffect, useState } from 'react';

interface AppleLiquidBackgroundProps {
  enabled: boolean;
}

export const AppleLiquidBackground: React.FC<AppleLiquidBackgroundProps> = ({ enabled }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Gentle parallax factor
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Liquid Mesh Layer */}
      <div 
        className="absolute inset-0 transition-transform duration-700 ease-out opacity-70"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
        }}
      >
        {/* Floating Liquid Orb 1 (Indigo / Blue) */}
        <div className="absolute -top-24 -left-24 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-indigo-400/25 via-blue-500/20 to-transparent blur-[110px] animate-liquid-1" />

        {/* Floating Liquid Orb 2 (Cyan / Turquoise) */}
        <div className="absolute top-[28%] -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-cyan-400/20 via-sky-500/15 to-transparent blur-[120px] animate-liquid-2" />

        {/* Floating Liquid Orb 3 (Violet / Pink) */}
        <div className="absolute top-[65%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-400/20 via-purple-500/15 to-transparent blur-[115px] animate-liquid-3" />

        {/* Floating Liquid Orb 4 (Amber / Golden Sunrise) */}
        <div className="absolute -bottom-20 right-[25%] w-[450px] h-[450px] rounded-full bg-gradient-to-t from-amber-300/15 via-rose-400/10 to-transparent blur-[100px] animate-liquid-1" />
      </div>

      {/* Subtle Noise / Refraction Grain */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent opacity-60" />
    </div>
  );
};
