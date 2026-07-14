import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { vi } from "vitest";

afterEach(() => cleanup());

Object.defineProperty(URL, "createObjectURL", { value: vi.fn(() => "blob:demo"), writable: true });
Object.defineProperty(URL, "revokeObjectURL", { value: vi.fn(), writable: true });
Object.defineProperty(HTMLAnchorElement.prototype, "click", { value: vi.fn(), writable: true });
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { value: vi.fn(), writable: true });
