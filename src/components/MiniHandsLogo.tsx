import wordmark from "@/assets/minihands-wordmark.png";

interface MiniHandsLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MiniHandsLogo({ size = "md", className = "" }: MiniHandsLogoProps) {
  const heights = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12 md:h-14",
  };

  return (
    <img
      src={wordmark}
      alt="MiniHands"
      className={`${heights[size]} w-auto ${className}`}
    />
  );
}
