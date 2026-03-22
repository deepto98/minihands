import logo from "@/assets/minihands-logo.png";

interface MiniHandsLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MiniHandsLogo({ size = "md", className = "" }: MiniHandsLogoProps) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-sm", gap: "gap-2.5" },
    md: { icon: "w-10 h-10", text: "text-xl", gap: "gap-3" },
    lg: { icon: "w-14 h-14", text: "text-3xl", gap: "gap-4" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <img src={logo} alt="" className={`${s.icon} rounded-xl`} />
      <span
        className={`${s.text} font-semibold tracking-tight text-foreground`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        minihands
      </span>
    </div>
  );
}
