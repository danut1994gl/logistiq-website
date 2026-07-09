// Legal identity + contact details for the operating company, in ONE place.
// Consumed by SiteFooter, the contact page, and the Organization JSON-LD.
export const company = {
  legalName: "HOSTLIFE DIGITAL SRL",
  cui: "52638053",
  regCom: "J25/759/2025",
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
  // Pricing (EUR / month): Professional 139, Enterprise 500 / 800 / 1590.
  priceLow: "139",
  priceHigh: "1590",
  priceCurrency: "EUR",
  offerCount: 4,
  // Real social profile URLs. Leave a value empty to omit that network entirely —
  // we never render dead links.
  socials: {
    linkedin: "",
    facebook: "",
  } as Record<string, string>,
};

export type Company = typeof company;
