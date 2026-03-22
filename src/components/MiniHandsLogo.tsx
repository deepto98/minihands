import logo from "@/assets/minihands-logo.png";

interface MiniHandsLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MiniHandsLogo({ size = "md", className = "" }: MiniHandsLogoProps) {
  const sizes = {
    sm: { icon: "w-8 h-8", text: "text-base", gap: "gap-3" },
    md: { icon: "w-10 h-10", text: "text-xl", gap: "gap-3.5" },
    lg: { icon: "w-[52px] h-[52px]", text: "text-[2rem]", gap: "gap-5" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <img src={logo} alt="" className={`${s.icon} rounded-full`} />
      <span className={`${s.text} font-medium tracking-[-0.01em] text-foreground`}>
        minihands
      </span>
    </div>
  );
}