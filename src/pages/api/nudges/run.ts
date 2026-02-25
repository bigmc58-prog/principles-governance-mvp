import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/prisma";

/**
 * Hook this route to a cron job (Vercel Cron / GitHub Actions).
 * MVP: returns the next nudge suggestions; you can later send email/push.
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const org = await prisma.org.findFirst();
  if (!org) return res.status(200).json({ ok: true, nudges: [] });

  const nudges = [
    "Chair check-in: Are we drifting into operations? If yes, reframe as policy or delegate back to the executive.",
    "Agenda discipline: Ensure at least one item advances Ends review or monitoring.",
    "Boundary reminder: The board speaks through policy; the executive decides means within constraints.",
  ];

  // In a real version, store nudge history per org/user.
  res.status(200).json({ ok: true, org: { id: org.id, lcmsMode: org.lcmsMode }, nudges });
}
