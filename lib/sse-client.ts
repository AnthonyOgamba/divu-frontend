export type SseMessage = { id?: string; event: string; data: unknown };

export async function consumeSse(
  url: string,
  options: { signal: AbortSignal; lastEventId?: string; onOpen?: () => void; onEvent: (message: SseMessage) => void },
) {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    headers: options.lastEventId ? { "Last-Event-ID": options.lastEventId } : undefined,
    signal: options.signal,
  });
  if (!response.ok || !response.body) throw new Error(`Live updates returned HTTP ${response.status}.`);
  options.onOpen?.();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (!options.signal.aborted) {
    const { done, value } = await reader.read();
    if (done) throw new Error("Live update stream closed.");
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const lines = frame.split("\n");
      if (!lines.every((line) => line.startsWith(":"))) {
        let id: string | undefined;
        let event = "message";
        const data: string[] = [];
        for (const line of lines) {
          if (line.startsWith("id:")) id = line.slice(3).trimStart();
          else if (line.startsWith("event:")) event = line.slice(6).trimStart();
          else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
        }
        if (data.length) {
          const raw = data.join("\n");
          let parsed: unknown = raw;
          try { parsed = JSON.parse(raw); } catch {}
          options.onEvent({ id, event, data: parsed });
        }
      }
      boundary = buffer.indexOf("\n\n");
    }
  }
}

export function subscribeSse(
  url: string,
  eventNames: readonly string[],
  onEvent: (message: SseMessage) => void,
  onState?: (state: "live" | "reconnecting") => void,
) {
  const controller = new AbortController();
  const supported = new Set(eventNames);
  const seen = new Set<string>();
  let lastEventId: string | undefined;
  let attempts = 0;
  void (async () => {
    while (!controller.signal.aborted) {
      try {
        await consumeSse(url, {
          signal: controller.signal,
          lastEventId,
          onOpen: () => { attempts = 0; onState?.("live"); },
          onEvent: (message) => {
            if (message.id && seen.has(message.id)) return;
            if (message.id) {
              lastEventId = message.id;
              seen.add(message.id);
              if (seen.size > 250) seen.delete(seen.values().next().value!);
            }
            if (supported.has(message.event)) onEvent(message);
          },
        });
      } catch {
        if (controller.signal.aborted) break;
        attempts += 1;
        onState?.("reconnecting");
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, Math.min(30_000, 1_000 * 2 ** Math.min(attempts, 5)));
          controller.signal.addEventListener("abort", () => { clearTimeout(timer); resolve(); }, { once: true });
        });
      }
    }
  })();
  return () => controller.abort();
}
