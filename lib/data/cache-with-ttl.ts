/** Process-local cache keyed by JSON-serialized args, with a fixed TTL.
 * Concurrent calls for the same key share the in-flight promise, so a cold
 * cache doesn't trigger redundant duplicate fetches. Failed calls aren't
 * cached, so a transient error doesn't get stuck for the TTL window.
 *
 * Deliberately not `unstable_cache`/`"use cache"`: those require Next's
 * request-scoped runtime, which isn't present when this module's tests call
 * these functions directly under Vitest against the real database. */
export function withTtlCache<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
  ttlMs: number
): (...args: Args) => Promise<T> {
  const store = new Map<string, { promise: Promise<T>; expiresAt: number }>();

  return (...args: Args): Promise<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = store.get(key);
    if (cached && cached.expiresAt > now) return cached.promise;

    const promise = fn(...args).catch((error: unknown) => {
      store.delete(key);
      throw error;
    });
    store.set(key, { promise, expiresAt: now + ttlMs });
    return promise;
  };
}
