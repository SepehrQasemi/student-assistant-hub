import { webcrypto } from "node:crypto";
import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = webcrypto as Crypto;
}

const pointerCapturePolyfills = {
  hasPointerCapture: () => false,
  setPointerCapture: () => undefined,
  releasePointerCapture: () => undefined,
};

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = pointerCapturePolyfills.hasPointerCapture;
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = pointerCapturePolyfills.setPointerCapture;
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = pointerCapturePolyfills.releasePointerCapture;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}
