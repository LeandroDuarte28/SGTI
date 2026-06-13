import { cn } from "@/lib/utils/cn";

describe("cn — Tailwind class merger", () => {
  it("merges simple class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });
  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });
  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });
});
