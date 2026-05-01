import type { HttpMethod } from "@/lib/openapi";

const METHOD_STYLES: Record<HttpMethod, string> = {
  get: "border-emerald-200 bg-emerald-50 text-emerald-700",
  post: "border-blue-200 bg-blue-50 text-blue-700",
  put: "border-amber-200 bg-amber-50 text-amber-700",
  patch: "border-violet-200 bg-violet-50 text-violet-700",
  delete: "border-rose-200 bg-rose-50 text-rose-700",
  options: "border-slate-200 bg-slate-50 text-slate-700",
  head: "border-slate-200 bg-slate-50 text-slate-700",
  trace: "border-slate-200 bg-slate-50 text-slate-700",
};

interface MethodBadgeProps {
  method: HttpMethod;
  compact?: boolean;
}

export function MethodBadge({ method, compact = false }: MethodBadgeProps) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center rounded border font-mono font-semibold uppercase tracking-normal",
        compact ? "h-5 min-w-10 px-1.5 text-[10px]" : "h-6 min-w-12 px-2 text-[11px]",
        METHOD_STYLES[method],
      ].join(" ")}
    >
      {method}
    </span>
  );
}
