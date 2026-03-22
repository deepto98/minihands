import wordmark from "@/assets/minihands-wordmark.png";

interface MiniHandsLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MiniHandsLogo({ size = "md", className = "" }: MiniHandsLogoProps) {
  const heights = {
    sm: "h-12",
    md: "h-16",
    lg: "h-24 md:h-28",
  };

  return (
    <div className={`${heights[size]} inline-flex items-center ${className}`}>
      <img
        src={wordmark}
        alt="MiniHands"
        className="h-full w-auto rounded-lg"
        style={{
          mask: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
          maskComposite: "intersect",
          WebkitMask: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
          WebkitMaskComposite: "destination-in",
        }}
      />
    </div>
  );
}
