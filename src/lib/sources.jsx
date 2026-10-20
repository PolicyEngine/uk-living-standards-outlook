// Source lines under each chart, and the plain-words substitution for the
// "HBAI" abbreviation in text taken from outlook.json.

export const HBAI_URL =
  "https://www.gov.uk/government/statistics/households-below-average-income-for-financial-years-ending-1995-to-2025";
export const HBAI_TITLE = "Households Below Average Income: FYE 1995 to FYE 2025";
export const OBR_EFO_URL = "https://obr.uk/efo/economic-and-fiscal-outlook-march-2026/";
export const OBR_EFO_TITLE = "Economic and fiscal outlook – March 2026";

const ext = { target: "_blank", rel: "noopener noreferrer" };

export const HbaiSource = () => (
  <>
    Source: DWP,{" "}
    <a href={HBAI_URL} {...ext}>
      {HBAI_TITLE}
    </a>{" "}
    (March 2026); PolicyEngine projections.
  </>
);

export const ObrSource = () => (
  <>
    Source: Office for Budget Responsibility,{" "}
    <a href={OBR_EFO_URL} {...ext}>
      {OBR_EFO_TITLE}
    </a>
    .
  </>
);

export const PeDerivedSource = () => <>Source: PolicyEngine calculation from ONS and OBR data.</>;

export const PeSource = () => <>Source: PolicyEngine projections (policyengine-uk on Microcosm data).</>;

/** Spell out "HBAI" in text from outlook.json. */
export function plainWords(text) {
  return String(text ?? "")
    .replace(/HBAI's (self-reported )?definition/g, "the $1definition in official statistics")
    .replace(/HBAI uses/g, "official statistics use")
    .replace(/HBAI's/g, "official statistics")
    .replace(/(the )?HBAI admin-linked series/g, "the official admin-linked series")
    .replace(/\bHBAI\b/g, "Households Below Average Income");
}
