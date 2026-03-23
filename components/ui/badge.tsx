import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-slate-900 text-white",
      muted: "bg-slate-100 text-slate-700",
      accent: "bg-teal-100 text-teal-800",
      danger: "bg-red-100 text-red-700",
    },
  },
  defaultVariants: {
    variant: "muted",
  },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
