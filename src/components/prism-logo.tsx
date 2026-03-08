import { cn } from "@/lib/utils";

interface PrismLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function PrismLogo({ size = "md", className }: PrismLogoProps) {
  return (
    <span
      className={cn(
        "font-sans tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      <span className="font-bold text-primary">PR</span>
      <span className="font-light text-accent">ism</span>
    </span>
  );
}
