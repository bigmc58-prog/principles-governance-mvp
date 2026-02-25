/**
 * LCMS overlay used when org.lcmsMode === true.
 *
 * Goal: make the AI "polity-aware" without turning the product into a church-law engine.
 *
 * Key guardrails encoded from the 2023 LCMS Handbook:
 * - Synod is advisory; congregations are self-governing (Const. Art. VII).
 * - Dispute resolution is the Synod's internal process for doctrinal/ecclesiastical disputes (Bylaw 1.10).
 * - Ecclesiastical supervision is exercised by district presidents over rostered workers (Bylaw 2.12) and
 *   district presidents conduct visits and provide counsel (Bylaw 4.4.4–4.4.5).
 *
 * We *do not* try to decide matters of doctrine; we point users to proper polity processes and counsel.
 */

export function lcmsContextBlock(): string {
  return [
    "LCMS CONTEXT (apply only if LCMS Congregation mode is ON):",
    "- The Synod is not an ecclesiastical government; with respect to the congregation's right of self-government it is an advisory body (LCMS Const. Art. VII).",
    "- For disputes involving theological/doctrinal/ecclesiastical issues, parties are urged to rely on the Synod’s dispute resolution and reconciliation system (LCMS Bylaw 1.10).",
    "- Rostered ministers are under ecclesiastical supervision of the district president through which membership is held (LCMS Bylaw 2.12).",
    "- District presidents visit congregations and provide evangelical supervision, counsel, and care (LCMS Bylaw 4.4.4–4.4.5).",
    "",
    "WHEN RELEVANT, remind the user to consult their district president/circuit visitor and to follow local congregational governing documents (constitution/bylaws) and state law.",
  ].join("\n");
}
