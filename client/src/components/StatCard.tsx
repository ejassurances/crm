import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: "navy" | "gold" | "green" | "blue" | "purple" | "orange";
  className?: string;
}

const colorMap = {
  navy: { bg: "bg-[#0f1f3d]", text: "text-white", icon: "bg-white/15 text-white" },
  gold: { bg: "bg-amber-50", text: "text-amber-900", icon: "bg-amber-100 text-amber-600" },
  green: { bg: "bg-emerald-50", text: "text-emerald-900", icon: "bg-emerald-100 text-emerald-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-900", icon: "bg-blue-100 text-blue-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-900", icon: "bg-purple-100 text-purple-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-900", icon: "bg-orange-100 text-orange-600" },
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  color = "navy",
  className,
}: StatCardProps) {
  const colors = colorMap[color];
  return (
    <Card className={cn("overflow-hidden border-0 shadow-sm card-hover", colors.bg, className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn("text-xs font-medium uppercase tracking-wider mb-1 opacity-70", colors.text)}>
              {label}
            </p>
            <p className={cn("text-3xl font-bold font-serif", colors.text)}>{value}</p>
            {trend && (
              <p className={cn("text-xs mt-1 opacity-70", colors.text)}>
                {trendUp ? "↑" : "↓"} {trend}
              </p>
            )}
          </div>
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", colors.icon)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
