// Legal identity + contact details for the operating company, in ONE place.
// Consumed by SiteFooter, the contact page, and the Organization JSON-LD.
export const company = {
  legalName: "HOSTLIFE DIGITAL SRL",
  cui: "52638053",
  regCom: "J25/759/2025",
  addressLines: ["Str. Vidin 37, Tecuci", "Jud. Galați, 805300"],
  email: "contact@logistiq.ro",
  // Real social profile URLs. Leave a value empty to omit that network entirely —
  // we never render dead links.
  socials: {
    linkedin: "",
    facebook: "",
  } as Record<string, string>,
};

export type Company = typeof company;
