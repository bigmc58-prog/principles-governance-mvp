import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";
import { quickHeuristicClassify } from "@/server/governance/classify";

async function getOrCreate() {
  let org = await prisma.org.findFirst();
  if (!org) org = await prisma.org.create({ data: { name: "My Board", lcmsMode: false } });

  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { email: "demo@example.com", name: "Demo Chair", orgId: org.id } });

  return { org, user };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { org, user } = await getOrCreate();
  const { question } = req.body ?? {};
  if (typeof question !== "string" || !question.trim()) return res.status(400).json({ error: "Missing question" });

  const out = quickHeuristicClassify(question, { lcmsMode: org.lcmsMode });

await prisma.scenario.create({
  data: {
    orgId: org.id,
    userId: user.id,
    scenario: question,
    authority: out.result,
    authorityWhy: out.rationale,
    routing: out.routing ?? null,
    routingRationale: out.routingRationale ?? null,
  },
});

  await prisma.qARun.create({
    data: {
      orgId: org.id,
      userId: user.id,
      question,
      result: out.result,
      rationale: out.rationale,
    },
  });

  res.status(200).json(out);
}
