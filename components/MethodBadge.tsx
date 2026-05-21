import type { HttpMethod } from "@/lib/openapi";

const METHOD_STYLES: Record<HttpMethod, string> = {
  get: "border-[#bec6a6] bg-[#f3f5ea] text-[#4f6134]",
  post: "border-[#c6d2e3] bg-[#eef3fa] text-[#365985]",
  put: "border-[#cbd6e6] bg-[#f1f5fb] text-[#3f628f]",
  patch: "border-[#d0cbe4] bg-[#f4f2fa] text-[#5a4f82]",
  delete: "border-[#efc4cb] bg-[#fbedf0] text-[#9b2f45]",
  options: "border-slate-200 bg-slate-50 text-slate-700",
  head: "border-slate-200 bg-slate-50 text-slate-700",
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
