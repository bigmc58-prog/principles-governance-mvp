import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";
import { openai } from "@/server/openai";
import { quickHeuristicClassify } from "@/server/governance/classify";
import { meetingReadySystemPrompt, meetingReadyUserPrompt } from "@/server/governance/meetingReady";

async function getOrCreate() {
  let org = await prisma.org.findFirst();
  if (!org) org = await prisma.org.create({ data: { name: "My Board", lcmsMode: false } });

  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { email: "demo@example.com", name: "Demo Chair", orgId: org.id } });

  return { org, user };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { org } = await getOrCreate();
  const { scenario } = req.body ?? {};
  if (typeof scenario !== "string" || !scenario.trim()) return res.status(400).json({ error: "Missing scenario" });

  // Reuse classifier for authority + routing
  const cls = quickHeuristicClassify(scenario, { lcmsMode: org.lcmsMode });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: meetingReadySystemPrompt({ lcmsMode: org.lcmsMode }) },
      { role: "user", content: meetingReadyUserPrompt({
        scenario,
        authority: cls.result,
        routing: cls.routing,
        routingRationale: cls.routingRationale,
      }) },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  let json: any = {};
  try { json = JSON.parse(content); } catch { json = { error: "Invalid model JSON", raw: content }; }

await prisma.scenario.create({
  data: {
    orgId: org.id,
    userId: user.id,
    scenario,
    authority: cls.result,
    authorityWhy: cls.rationale,
    routing: cls.routing ?? null,
    routingRationale: cls.routingRationale ?? null,
    meetingReady: json,
  },
});

res.status(200).json({ classification: cls, meetingReady: json });

}
