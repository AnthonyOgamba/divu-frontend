import { Blocks } from "lucide-react";

export function BackendFeatureUnavailable({ title = "Backend feature unavailable", detail }: { title?: string; detail?: string }) {
  return <section className="rounded-xl border border-dashed bg-card p-8 text-center">
    <Blocks className="mx-auto size-8 text-muted-foreground" />
    <h2 className="mt-3 text-base font-semibold">{title}</h2>
    <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">This feature requires an API that is not available in the current backend contract.</p>
    {detail && <p className="mx-auto mt-2 max-w-2xl text-xs text-muted-foreground">{detail}</p>}
  </section>;
}
