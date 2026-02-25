import { z } from "zod";
import { lcmsPolityQuestions } from "./lcmsQuestions";
import { routingRecommendation } from "./routing";

export const AuthorityClassSchema = z.enum(["BOARD", "EXECUTIVE", "POLICY_LEVEL", "UNCLEAR"]);
export type AuthorityClass = z.infer<typeof AuthorityClassSchema>;

export type Routing =
  | "Local governance"
  | "Consult DP/CV"
  | "Consider Bylaw 1.10 pathway"
  | "Civil counsel + reconciliation"
  | "Consult executive delegate"
  | "Clarify authority first";

export type Classification = {
  result: AuthorityClass;
  rationale: string;
  clarifyingQuestions: string[];
  routing?: Routing;
  routingRationale?: string;
};

const KEYWORDS_BOARD = [
  "policy", "ends", "mission", "vision", "values", "limitations", "constraints", "monitoring",
  "board chair", "board agenda", "governance process", "delegation", "oversight"
];
const KEYWORDS_EXEC = [
  "hire", "fire", "supervise", "vendor", "schedule", "staff", "facility", "budget line item",
  "communications", "program", "operations", "implementation"
];

export function quickHeuristicClassify(input: string, opts?: { lcmsMode?: boolean }): Classification {
  const t = input.toLowerCase();
  const boardHits = KEYWORDS_BOARD.filter(k => t.includes(k)).length;
  const execHits = KEYWORDS_EXEC.filter(k => t.includes(k)).length;

  let result: AuthorityClass = "UNCLEAR";
  if (boardHits > execHits && boardHits >= 1) result = "BOARD";
  else if (execHits > boardHits && execHits >= 1) result = "EXECUTIVE";
  else if (boardHits === execHits && boardHits >= 1) result = "POLICY_LEVEL";

  const baseQuestions = [
  "Is the board trying to set/clarify policy (Ends/constraints/monitoring), or direct a specific operational action?",
  "What existing policy or governing document (if any) already covers this?",
  "Who is the designated executive delegate for operations right now?",
];

const polityQuestions = opts?.lcmsMode ? lcmsPolityQuestions(input) : [];

const clarifyingQuestions = [...baseQuestions, ...polityQuestions].slice(0, 6);

  return {
    result,
    routing,
    routingRationale,
    rationale:
      result === "BOARD"
        ? "Keywords suggest a governance/policy decision (board-level)."
        : result === "EXECUTIVE"
        ? "Keywords suggest operational execution (executive-level)."
        : result === "POLICY_LEVEL"
        ? "Keywords suggest the issue touches both policy framing and operational detail—likely needs policy-level clarification."
        : "Not enough signal—needs clarifying questions.",
    clarifyingQuestions,
  };
}
