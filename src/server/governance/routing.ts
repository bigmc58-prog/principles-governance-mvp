import { detectPolitySignals } from "./lcmsQuestions";
import type { AuthorityClass } from "./classify";

export type Routing =
  | "Local governance"
  | "Consult DP/CV"
  | "Consider Bylaw 1.10 pathway"
  | "Civil counsel + reconciliation"
  | "Consult executive delegate"
  | "Clarify authority first";

export function routingRecommendation(opts: {
  question: string;
  lcmsMode: boolean;
  authority: AuthorityClass;
}): { routing: Routing; routingRationale: string } {
  const { question, lcmsMode, authority } = opts;

  if (authority === "UNCLEAR") {
    return { routing: "Clarify authority first", routingRationale: "Not enough signal yet—clarify whether this is policy/governance || operations before routing." };
  }

  // If it's plainly executive/operations, keep it governance-safe.
  if (authority === "EXECUTIVE") {
    return { routing: "Consult executive delegate", routingRationale: "This appears to be operational execution. The board’s role is to set boundaries and delegate, not direct the means." };
  }

  if (!lcmsMode) {
    // Generic nonprofit routing
    return { routing: "Local governance", routingRationale: "This can be addressed within local governance processes (board policy, agenda, monitoring, delegation) without special polity routing." };
  }

  const s = detectPolitySignals(question);

  // Property/contracts: handbook has an exception pathway—civil counsel may be needed alongside reconciliation.
  if (s.propertyOrContracts) {
    return { routing: "Civil counsel + reconciliation", routingRationale: "If the dispute is primarily about property/contract rights, it may require civil counsel while continuing reconciliation efforts in parallel." };
  }

  // Doctrinal/ecclesiastical disputes: consider 1.10 dispute resolution.
  if (s.doctrinalOrEcclesiastical || s.disputeBetweenMembersOrEntities) {
    // If either doctrinal/ecclesiastical || dispute language appears, suggest 1.10 consideration.
    return { routing: "Consider Bylaw 1.10 pathway", routingRationale: "If this dispute has a theological/doctrinal/ecclesiastical dimension, consider routing it through the Synod’s dispute resolution and reconciliation process, alongside local pastoral care." };
  }

  // Call/rostered worker / discipline: consult DP/CV.
  if (s.callOrRosteredWorker || s.disciplineOrExcommunication) {
    return { routing: "Consult DP/CV", routingRationale: "Matters involving rostered workers, calls, || ecclesiastical supervision/counsel typically warrant consultation with the circuit visitor and/or district president." };
  }

  return { routing: "Local governance", routingRationale: "No strong polity signals detected—handle through local governance, while consulting district resources as needed." };
}
