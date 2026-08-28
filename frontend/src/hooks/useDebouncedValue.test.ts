import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 300));
    expect(result.current).toBe("a");
  });

  it("does not update before the delay elapses", () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: "a" } }
      );

      rerender({ value: "b" });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe("a");
    } finally {
      vi.useRealTimers();
    }
  });

  it("updates to the latest value once the delay elapses", () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: "a" } }
      );

      rerender({ value: "b" });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe("b");
    } finally {
      vi.useRealTimers();
    }
  });

  it("resets the timer on rapid successive changes (only the last value wins)", () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 300),
        { initialProps: { value: "a" } }
      );

      rerender({ value: "b" });
      act(() => {
        vi.advanceTimersByTime(150);
      });
      rerender({ value: "c" });
      act(() => {
        vi.advanceTimersByTime(150);
      });
      // Only 150ms since "c" was set; debounce hasn't elapsed yet.
      expect(result.current).toBe("a");

      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(result.current).toBe("c");
    } finally {
      vi.useRealTimers();
    }
  });
});
