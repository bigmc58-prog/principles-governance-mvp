import { buildSystemPrompt } from "./systemPrompt";
import type { AuthorityClass, Routing } from "./classify";

export type MeetingReadyOutput = {
  agendaItemTitle: string;
  decisionQuestions: string[];
  motionTemplate: string;
  monitoringProposal: string;
  notes?: string;
};

export function meetingReadySystemPrompt(opts: { lcmsMode: boolean }): string {
  // Reuse coach system prompt guardrails, but require JSON and meeting-ready outputs.
  const base = buildSystemPrompt({ lcmsMode: opts.lcmsMode });
  return [
    base,
    "",
    "You will produce MEETING-READY outputs for a board chair.",
    "Hard constraints:",
    "- Governance-level language only (no operational 'how to').",
    "- If authority is EXECUTIVE, produce outputs that frame a delegation/monitoring conversation, not instructions.",
    "- If LCMS mode is ON and the scenario has ecclesiastical/doctrinal/dispute/call/discipline signals, keep language polity-aware and route to appropriate counsel/process without deciding doctrine.",
    "",
    "Return JSON ONLY with this schema:",
    "{",
    '  "agendaItemTitle": "string (<= 90 chars)",',
    '  "decisionQuestions": ["3-5 short questions, policy-level"],',
    '  "motionTemplate": "string (chair-safe motion; if not appropriate, provide a placeholder like \"No motion—information/discernment only\" )",',
    '  "monitoringProposal": "string (how the board will know; what report/indicator; cadence; who provides it)",',
    '  "notes": "optional short note"',
    "}",
  ].join("\n");
}

export function meetingReadyUserPrompt(opts: {
  scenario: string;
  authority: AuthorityClass;
  routing?: Routing;
  routingRationale?: string;
}): string {
  const { scenario, authority, routing, routingRationale } = opts;
  return [
    "Scenario:",
    scenario,
    "",
    `Known classification: ${authority}`,
    routing ? `Routing recommendation: ${routing}` : "",
    routingRationale ? `Routing rationale: ${routingRationale}` : "",
    "",
    "Produce meeting-ready outputs now.",
  ].filter(Boolean).join("\n");
}
