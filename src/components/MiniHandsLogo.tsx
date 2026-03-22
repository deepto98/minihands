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
    <img
      src={wordmark}
      alt="MiniHands"
      className={`${heights[size]} w-auto ${className}`}
    />
  );
}
