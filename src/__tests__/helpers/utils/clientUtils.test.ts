/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from "vitest";
import {
  isClient,
  safeLocalStorageGet,
  safeLocalStorageGetJSON,
  safeLocalStorageRemove,
  safeLocalStorageSet,
  safeLocalStorageSetJSON,
} from "@/helpers/utils/clientUtils";

describe("clientUtils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("detects client", () => {
    expect(isClient()).toBe(true);
  });

  it("gets/sets/removes strings and JSON", () => {
    safeLocalStorageSet("k", "v");
    expect(safeLocalStorageGet("k")).toBe("v");
    safeLocalStorageSetJSON("j", { a: 1 });
    expect(safeLocalStorageGetJSON<{ a: number }>("j")).toEqual({ a: 1 });
    expect(safeLocalStorageGetJSON("missing")).toBeNull();
    localStorage.setItem("bad", "{");
    expect(safeLocalStorageGetJSON("bad")).toBeNull();
    safeLocalStorageRemove("k");
    expect(safeLocalStorageGet("k")).toBeNull();
  });
});
