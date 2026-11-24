import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";

// A dispatcher's departments are their hard boundary (Logistiq ADR-013, migration 138): a
// dispatcher sees and works only on the check-ins and bookings of their departments, and
// one with no department sees nothing. Since ADR-014 (migrations 147–152, and 249 for
// delete) each department carries its own grants, separately for check-ins and bookings:
// read, manage, new and delete. Until 2026-11-24, in all 8 languages, the access-control
// page (f17Page) said the opposite: "warehouse-wide visibility", every dispatcher reading
// and updating every check-in of the warehouse, no permission to pick, and a matrix whose
// dispatcher rows could see every check-in.

// "warehouse-wide" and "every check-in in their warehouse", as each language said them.
const WAREHOUSE_WIDE =
  /tot depozitul|nivel de depozit|warehouse-wide|gesamte[sn]? Lager|cały magazyn|całym magazynie|raktárszint|в целия склад|tout l'entrepôt|l'échelle de l'entrepôt|heel het magazijn|hele magazijn/i;
const EVERY_CHECKIN =
  /orice check-in din depozitul|every check-in in their warehouse|jeden Check-in in seinem Lager|każdy check-in w swoim magazynie|raktára (minden|összes) check-inj|всеки check-in в своя склад|tous les check-ins de son entrepôt|elke check-in in zijn magazijn/i;

// Roles (rows): warehouse manager, professional, dispatcher with departments, dispatcher
// with none. Capabilities (columns): check-ins, departments & ramps, creating dispatchers,
// operator check-in. "P" is partial: the dispatcher's own departments, as granted; with no
// department, only a waiting check-in at the entry point, where the per-user switch allows it.
const MATRIX = "YYYY" + "YYYY" + "PNNP" + "NNNP";

describe("access-control page (f17)", () => {
  it("draws dispatchers bound to their departments in the matrix", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.f17Page.mxCell, locale).toBe(MATRIX);
    }
  });

  it("no language calls a dispatcher's visibility warehouse-wide", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const text = JSON.stringify(copy.f17Page);
      expect(text.match(WAREHOUSE_WIDE)?.[0], locale).toBeUndefined();
      expect(text.match(EVERY_CHECKIN)?.[0], locale).toBeUndefined();
    }
  });

  it("answers yes to limiting a dispatcher to their departments", () => {
    const YES: Record<string, RegExp> = {
      ro: /^Da\s/, en: /^Yes\s/, de: /^Ja\s/, pl: /^Tak\s/, hu: /^Igen\s/, bg: /^Да\s/, fr: /^Oui\s/, nl: /^Ja\s/,
    };
    expect(Object.keys(YES).sort()).toEqual(Object.keys(translations).sort());
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.f17Page.a1, locale).toMatch(YES[locale]);
    }
  });
});
