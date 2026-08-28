import "@testing-library/jest-dom/vitest";

// TanStack Virtual needs layout measurements that jsdom doesn't provide by
// default; without these, getVirtualItems() always returns an empty array.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= MockResizeObserver;

Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  value: 800,
});
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  value: 800,
});

HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    width: 800,
    height: 800,
    top: 0,
    left: 0,
    bottom: 800,
    right: 800,
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  } as DOMRect;
};

