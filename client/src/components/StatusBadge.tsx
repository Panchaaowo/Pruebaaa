import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'completed':
      case 'excellent':
      case 'good':
        return "bg-green-100 text-green-700 border-green-200";
      case 'pending':
      case 'regular':
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'bad':
      case 'delivered':
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide",
      getStyles(status)
    )}>
      {status}
    </span>
  );
}
