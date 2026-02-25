/**
 * Minimal "principle map" scaffold.
 * In production, load this from a JSON file that you refine over time.
 *
 * The AI must always: (1) classify authority before advising, (2) ask clarifying questions first,
 * (3) avoid operational advice, (4) name the relevant principle(s).
 */
export type Principle = {
  id: string;
  name: string;
  diagnosticQuestions: string[];
  boundaryWarnings: string[];
};

export const PRINCIPLES: Principle[] = [
  {
    id: "role-clarity",
    name: "Role clarity (board vs executive)",
    diagnosticQuestions: [
      "What decision is being contemplated—policy/Ends/constraints/monitoring, or day-to-day operations?",
      "Who currently has delegated authority for this area?",
      "Is there an existing policy that already speaks to this?",
    ],
    boundaryWarnings: [
      "Risk of board drift into operations.",
      "Risk of undermining the single point of accountability.",
    ],
  },
  {
    id: "single-delegate",
    name: "Single point of delegation/accountability",
    diagnosticQuestions: [
      "Who is the sole delegate (CEO/Exec Dir/Pastor) accountable for operations?",
      "Are there multiple 'direct reports' to the board creating parallel authority?",
    ],
    boundaryWarnings: [
      "Splitting authority creates confusion and conflict.",
    ],
  },
];
