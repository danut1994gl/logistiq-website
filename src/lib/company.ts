// Legal identity + contact details for the operating company, in ONE place.
// Consumed by SiteFooter, the contact page, and the Organization JSON-LD.
export const company = {
  legalName: "HOSTLIFE DIGITAL SRL",
  cui: "52638053",
  // The owner's number (2026-11-26). Until then this file said another one, while the
  // legal pages said this: the legal pages now read it from here (lib/legal-identity.ts).
  regCom: "J20/7592/5001",
  addressLines: ["Str. Vidin 37, Tecuci", "Jud. Galați, 805300"],
  address: {
    street: "Str. Vidin 37",
    city: "Tecuci",
    region: "Galați",
    postalCode: "805300",
    country: "RO",
  },
  email: "contact@logistiq.ro",
  phone: "+40771570577",
  // No prices here: Logistiq publishes none (owner, 2026-11-08). The price is set
  // by the offer or contract, so the site, the JSON-LD and llms.txt state none.
  // Real social profile URLs. Leave a value empty to omit that network entirely —
  // we never render dead links.
  socials: {
    linkedin: "",
    facebook: "",
  } as Record<string, string>,
};

export type Company = typeof company;
