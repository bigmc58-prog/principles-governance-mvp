/**
 * LCMS polity-aware clarifying questions to add when org.lcmsMode === true.
 *
 * This does NOT decide doctrine. It helps the chair frame the issue and route it
 * toward appropriate ecclesiastical counsel/process when relevant.
 */

export type PolitySignals = {
  doctrinalOrEcclesiastical: boolean;
  disputeBetweenMembersOrEntities: boolean;
  callOrRosteredWorker: boolean;
  disciplineOrExcommunication: boolean;
  propertyOrContracts: boolean;
};

const RX = {
  doctrinal: /(doctrine|false doctrine|teach(ing)?|confession|confessions|lutheran confessions|scripture|theology|ctcr|sermon|altar|pulpit|communion|closed communion|worship practice|syncretism|unionism)/i,
  dispute: /(dispute|complaint|accusation|appeal|grievance|conflict|reconciliation|panel|hearing|mediation)/i,
  callRoster: /(call(ed)?|divine call|pastor|associate pastor|vicar|deaconess|dce|commissioned|ordain|ordination|install|installation|rostered|roster|district president|circuit visitor)/i,
  discipline: /(discipline|excommunication|remove from membership|barred|suspended|church discipline|matthew 18)/i,
  propertyContracts: /(property|real estate|building|sale|mortgage|debt|lawsuit|court|contract|agreement|employment benefit|severance)/i,
};

export function detectPolitySignals(text: string): PolitySignals {
  const t = text ?? "";
  return {
    doctrinalOrEcclesiastical: RX.doctrinal.test(t),
    disputeBetweenMembersOrEntities: RX.dispute.test(t),
    callOrRosteredWorker: RX.callRoster.test(t),
    disciplineOrExcommunication: RX.discipline.test(t),
    propertyOrContracts: RX.propertyContracts.test(t),
  };
}

export function lcmsPolityQuestions(text: string): string[] {
  const s = detectPolitySignals(text);
  const out: string[] = [];

  // Always helpful baseline in LCMS mode
  out.push("Are you dealing with something governed by the congregation’s own constitution/bylaws, or are you trying to apply a synodical/district process to it?");
  out.push("Is the question about what the congregation should do locally (self-governance), or are you asking for synodical guidance/counsel to inform local decisions?");

  if (s.doctrinalOrEcclesiastical) {
    out.push("Does this involve a theological/doctrinal/ecclesiastical question (teaching, confession, worship practice), rather than a preference or operational matter?");
    out.push("Who is the appropriate ecclesiastical supervisor/counsel for this issue (e.g., pastor, circuit visitor, district president)?");
  }

  if (s.disputeBetweenMembersOrEntities) {
    out.push("Is this a dispute among members/entities where reconciliation is the goal—and have informal reconciliation efforts been attempted first?");
    out.push("If the dispute has a theological/doctrinal/ecclesiastical dimension, should it be routed through the Synod’s dispute resolution and reconciliation process?");
  }

  if (s.callOrRosteredWorker) {
    out.push("Does this concern a rostered worker’s call, installation, supervision, or fitness for ministry, where district-level ecclesiastical supervision/counsel is typically involved?");
    out.push("Have you consulted the district president (or the appropriate ecclesiastical supervisor) before taking formal actions that could affect a call or roster status?");
  }

  if (s.disciplineOrExcommunication) {
    out.push("Is this a matter of church discipline/excommunication where Matthew 18 and local congregational discipline procedures are in view?");
    out.push("Are you challenging or reviewing the procedure used in an excommunication/discipline case, which may involve synodical dispute-resolution pathways?");
  }

  if (s.propertyOrContracts) {
    out.push("Is the dispute primarily about property/contractual rights (e.g., real estate, mortgages, contracts), which may require civil counsel even if reconciliation continues in parallel?");
  }

  // Keep list short (classifier already returns baseline questions)
  return out.slice(0, 6);
}
