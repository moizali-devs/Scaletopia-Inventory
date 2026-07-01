import type { NextRequest } from "next/server";
import { parseCompanyFilters } from "@/lib/data/companies-search-params";
import { runClayPush, type ClayPushProgress } from "@/lib/clay/push-to-clay";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function sseEvent(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: NextRequest) {
  const filters = parseCompanyFilters(request.nextUrl.searchParams);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await runClayPush(filters, {
          onProgress: (p: ClayPushProgress) => controller.enqueue(sseEvent({ type: "progress", ...p })),
        });
        controller.enqueue(sseEvent({ type: "done", result }));
      } catch (err) {
        controller.enqueue(sseEvent({ type: "error", message: (err as Error).message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
