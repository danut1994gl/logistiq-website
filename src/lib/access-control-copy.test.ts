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

// The dashboard's own labels (Logistiq apps/dashboard/messages/<locale>.json): the four
// rights of the dispatcher matrix (users.modal.matrix read, manage, new, delete) and the
// warehouse's operator check-in settings (settings.warehouse.operatorCheckin,
// operatorCheckinDepartments). Until 2026-11-24 the English page said "create" where the
// dashboard says "New".
const RIGHTS: Record<string, string[]> = {
  ro: ["Vizualizare", "Gestionare", "Adăugare", "Ștergere"],
  en: ["Read", "Manage", "New", "Delete"],
  de: ["Anzeigen", "Verwalten", "Hinzufügen", "Löschen"],
  pl: ["Podgląd", "Zarządzanie", "Dodawanie", "Usuwanie"],
  hu: ["Megtekintés", "Kezelés", "Hozzáadás", "Törlés"],
  bg: ["Преглед", "Управление", "Добавяне", "Изтриване"],
  fr: ["Voir", "Gérer", "Ajouter", "Supprimer"],
  nl: ["Bekijken", "Beheren", "Toevoegen", "Verwijderen"],
};
const SETTINGS: Record<string, [string, string]> = {
  ro: ["Check-in Operator", "Departamente Permise"],
  en: ["Operator Check-in", "Allowed Departments"],
  de: ["Operator-Check-in", "Zulässige Abteilungen"],
  pl: ["Odprawa przez operatora", "Dozwolone działy"],
  hu: ["Operátori bejelentkezés", "Engedélyezett részlegek"],
  bg: ["Чекиране от оператор", "Разрешени отдели"],
  fr: ["Enregistrement par l'opérateur", "Départements autorisés"],
  nl: ["Operator-check-in", "Toegestane afdelingen"],
};

describe("access-control page (f17)", () => {
  it("names the dispatcher's rights by the dashboard's labels", () => {
    expect(Object.keys(RIGHTS).sort()).toEqual(Object.keys(translations).sort());
    for (const [locale, copy] of Object.entries(translations)) {
      const f = copy.f17Page;
      for (const [key, text] of Object.entries({ s2d: f.s2d, a1: f.a1, a2: f.a2, coBody: f.coBody })) {
        for (const right of RIGHTS[locale]) expect(text, `${locale}.${key}`).toContain(right);
      }
    }
    expect(translations.en.f17Page.s2d).not.toMatch(/read, manage, create/i);
  });

  // A dispatcher with no department can at most create a waiting check-in at the entry
  // point: with the per-user switch, while the warehouse's Operator Check-in is on, and with
  // the entry department listed when Allowed Departments is set
  // (lib/checkins/manual-checkin-gate.ts waitingSwitchApplies, operatorCheckinEnabled).
  it("names every condition of a waiting check-in by a dispatcher without departments", () => {
    expect(Object.keys(SETTINGS).sort()).toEqual(Object.keys(translations).sort());
    for (const [locale, copy] of Object.entries(translations)) {
      for (const label of SETTINGS[locale]) expect(copy.f17Page.a1, locale).toContain(label);
    }
  });

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

  // The access-control card (features.feature17Desc: the features index, related-feature
  // cards and the page's meta description) kept the page's old subtitle until 2026-11-25,
  // "those departments decide who can run operator check-in, who can create bookings, and
  // which gates reach their quick-access", silent on what a dispatcher sees.
  it("the feature card says roles are fixed and departments bound what a dispatcher sees", () => {
    const OLD_CARD =
      /decid cine poate|decide who can|entscheiden, wer|decydują, kto|határozzák meg, ki|определят кой|déterminent qui|bepalen wie/i;
    for (const [locale, copy] of Object.entries(translations)) {
      const card = copy.features.feature17Desc;
      expect(card.match(OLD_CARD)?.[0], locale).toBeUndefined();
      expect(card.match(WAREHOUSE_WIDE)?.[0], locale).toBeUndefined();
      expect(card.match(EVERY_CHECKIN)?.[0], locale).toBeUndefined();
    }
    expect(translations.en.features.feature17Desc).toMatch(/^Fixed roles/);
    expect(translations.en.features.feature17Desc).toMatch(/The departments bound what a dispatcher sees and does; without one, a dispatcher sees nothing\./);
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
