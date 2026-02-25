import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/prisma";
import { openai } from "../../server/openai";
import { buildSystemPrompt } from "../../server/governance/systemPrompt";
import { PRINCIPLES } from "../../server/governance/principles";
type Msg = { role: "user" | "assistant"; content: string };

async function getOrCreate() {
  let org = await prisma.org.findFirst();
  if (!org) org = await prisma.org.create({ data: { name: "My Board", lcmsMode: false } });

  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { email: "demo@example.com", name: "Demo Chair", orgId: org.id } });

  let session = await prisma.chatSession.findFirst({ where: { orgId: org.id, userId: user.id }, orderBy: { updatedAt: "desc" }});
  if (!session) session = await prisma.chatSession.create({ data: { orgId: org.id, userId: user.id, title: "Coach" } });

  return { org, user, session };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { org, session } = await getOrCreate();
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages)) return res.status(400).json({ error: "Missing messages" });

  const clean: Msg[] = messages
    .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12);

  // Persist the latest user message (and later assistant reply)
  const last = clean[clean.length - 1];
  if (last?.role === "user") {
    await prisma.chatMessage.create({ data: { sessionId: session.id, role: "user", content: last.content }});
  }

  const system = buildSystemPrompt({ lcmsMode: org.lcmsMode });
  const principlesQuickRef = PRINCIPLES.map(p => `- ${p.name}: ${p.diagnosticQuestions[0]}`).join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: system + "\n\nPrinciples quick reference:\n" + principlesQuickRef },
      ...clean.map(m => ({ role: m.role, content: m.content })),
    ],
  });

  const reply = completion.choices[0]?.message?.content ?? "No reply.";

  await prisma.chatMessage.create({ data: { sessionId: session.id, role: "assistant", content: reply }});
  res.status(200).json({ reply });
}
