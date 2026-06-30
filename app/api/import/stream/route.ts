import type { NextRequest } from "next/server";
import { pushRecords, type PushProgress, type PushResult } from "@/lib/import/push";
import { parseCSV, applyColumnMap } from "@/lib/import/csv";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const IMPORT_TOKEN = "scaletopia-import-2026";

function sseEvent(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("X-Import-Token");
  if (token !== IMPORT_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response("Invalid form data", { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const metaRaw = formData.get("metadata") as string | null;

  if (!file || !metaRaw) {
    return new Response("Missing file or metadata", { status: 400 });
  }

  let meta: {
    targetTable: "companies" | "people";
    sourceKey: string;
    tags: [string, string, string];
    columnMap: Record<string, string>;
  };

  try {
    meta = JSON.parse(metaRaw);
  } catch {
    return new Response("Invalid metadata JSON", { status: 400 });
  }

  const csvText = await file.text();
  const { rows } = parseCSV(csvText);

  if (rows.length === 0) {
    return new Response("CSV has no data rows", { status: 400 });
  }

  const mappedRecords = applyColumnMap(rows, meta.columnMap);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const onProgress = (progress: PushProgress) => {
          controller.enqueue(sseEvent(progress));
        };

        const result: PushResult = await pushRecords(
          {
            records: mappedRecords,
            targetTable: meta.targetTable,
            sourceKey: meta.sourceKey,
            tags: meta.tags,
            columnMap: meta.columnMap,
          },
          onProgress
        );

        controller.enqueue(sseEvent({ phase: "done", result }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(sseEvent({ phase: "error", message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
