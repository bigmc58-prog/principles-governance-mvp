import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../server/prisma";

async function getOrCreate() {
  let org = await prisma.org.findFirst();
  if (!org) org = await prisma.org.create({ data: { name: "My Board", lcmsMode: false } });

  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { email: "demo@example.com", name: "Demo Chair", orgId: org.id } });

  return { org, user };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { org, user } = await getOrCreate();

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const limit = Math.min(Number(req.query.limit ?? 20) || 20, 50);

  const rows = await prisma.scenario.findMany({
    where: { orgId: org.id, userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  res.status(200).json({ scenarios: rows });
}
