import { vi } from "vitest";

export type MockResult = { data: unknown; error: unknown };

type CallLog = {
  method: string;
  args: unknown[];
};

/**
 * Fluent Supabase query builder mock.
 * Chainable methods resolve to `{ data, error }` when awaited (thenable).
 */
export function createSupabaseQueryBuilder(initial: MockResult = { data: null, error: null }) {
  let result: MockResult = { ...initial };
  const calls: CallLog[] = [];

  const builder: Record<string, unknown> = {};

  const record =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    };

  const methods = [
    "select",
    "insert",
    "upsert",
    "update",
    "delete",
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "like",
    "ilike",
    "is",
    "in",
    "contains",
    "containedBy",
    "range",
    "order",
    "limit",
    "offset",
    "match",
    "not",
    "or",
    "filter",
    "single",
    "maybeSingle",
    "csv",
    "abortSignal",
    "returns",
  ] as const;

  for (const m of methods) {
    builder[m] = record(m);
  }

  builder.then = (
    onFulfilled?: (value: MockResult) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected);

  return {
    builder,
    calls,
    setResult(next: MockResult) {
      result = { ...next };
    },
    getResult() {
      return result;
    },
    resetCalls() {
      calls.length = 0;
    },
  };
}

export type QueryBuilderHandle = ReturnType<typeof createSupabaseQueryBuilder>;

export type StorageMock = {
  from: ReturnType<typeof vi.fn>;
  upload: ReturnType<typeof vi.fn>;
  getPublicUrl: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
};

export function createSupabaseClientMock(defaultResult: MockResult = { data: [], error: null }) {
  const query = createSupabaseQueryBuilder(defaultResult);
  const fromCalls: { table: string; handle: QueryBuilderHandle }[] = [];
  const rpcCalls: { fn: string; args: unknown }[] = [];

  /** Per-table override of results (last set wins for that table). */
  const tableResults = new Map<string, MockResult>();
  /** Ordered queue of results consumed by successive from()/rpc() awaits. */
  const resultQueue: MockResult[] = [];

  const storageUpload = vi.fn(async () => ({ data: { path: "mock/path" }, error: null }));
  const storageGetPublicUrl = vi.fn(() => ({
    data: { publicUrl: "https://example.com/mock.png" },
  }));
  const storageRemove = vi.fn(async () => ({ data: null, error: null }));
  const storageFrom = vi.fn(() => ({
    upload: storageUpload,
    getPublicUrl: storageGetPublicUrl,
    remove: storageRemove,
  }));

  const auth = {
    getSession: vi.fn(async () => ({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    })),
    getUser: vi.fn(async () => ({
      data: { user: { id: "user-1" } },
      error: null,
    })),
    signOut: vi.fn(async () => ({ error: null })),
    admin: {
      createUser: vi.fn(async () => ({
        data: { user: { id: "new-user-1" } },
        error: null,
      })),
      listUsers: vi.fn(async () => ({
        data: { users: [{ id: "user-1", email: "a@test.com" }] },
        error: null,
      })),
      updateUserById: vi.fn(async () => ({
        data: { user: { id: "user-1" } },
        error: null,
      })),
      deleteUser: vi.fn(async () => ({ data: null, error: null })),
    },
  };

  const client = {
    from: vi.fn((table: string) => {
      const handle = createSupabaseQueryBuilder(
        resultQueue.shift() ?? tableResults.get(table) ?? query.getResult()
      );
      fromCalls.push({ table, handle });
      return handle.builder;
    }),
    rpc: vi.fn((fn: string, args?: unknown) => {
      rpcCalls.push({ fn, args });
      const handle = createSupabaseQueryBuilder(
        resultQueue.shift() ?? query.getResult()
      );
      return handle.builder;
    }),
    storage: {
      from: storageFrom,
    },
    auth,
  };

  return {
    client,
    query,
    fromCalls,
    rpcCalls,
    auth,
    storage: {
      from: storageFrom,
      upload: storageUpload,
      getPublicUrl: storageGetPublicUrl,
      remove: storageRemove,
    },
    setResult(result: MockResult) {
      query.setResult(result);
      resultQueue.length = 0;
      tableResults.clear();
    },
    setTableResult(table: string, result: MockResult) {
      tableResults.set(table, result);
    },
    enqueueResults(...results: MockResult[]) {
      resultQueue.push(...results);
    },
    reset() {
      fromCalls.length = 0;
      rpcCalls.length = 0;
      resultQueue.length = 0;
      tableResults.clear();
      query.setResult(defaultResult);
      query.resetCalls();
      vi.clearAllMocks();
    },
  };
}

export type SupabaseClientMock = ReturnType<typeof createSupabaseClientMock>;

/** Shared singleton used by vi.mock factories. */
export const supabaseMock = createSupabaseClientMock();

export function resetSupabaseMock(result: MockResult = { data: [], error: null }) {
  supabaseMock.reset();
  supabaseMock.setResult(result);
}
