import { describe, it, expect } from "vitest";
import { metadata } from "./layout";

// The root layout's metadata is the fallback title and description, in Romanian. Until
// 2026-11-24 the description was written without diacritics ("digitalizeaza operatiunile
// ... pentru soferi ... in timp real").
describe("root layout metadata", () => {
  it("writes the Romanian description with its diacritics", () => {
    const description = String(metadata.description);
    expect(description).toBe(
      "Logistiq digitalizează operațiunile din depozit. Check-in QR pentru șoferi, management rampe în timp real, comunicare instantanee.",
    );
    expect(description).not.toMatch(/digitalizeaza|operatiunile|soferi|\bin timp/);
    // comma-below ș and ț, never the cedilla forms
    expect(description).not.toMatch(/[şţŞŢ]/);
  });
});
