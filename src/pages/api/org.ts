import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";

// Demo: bootstrap a single org + single user.
// Replace with NextAuth later.
async function getOrCreate() {
  let org = await prisma.org.findFirst();
  if (!org) org = await prisma.org.create({ data: { name: "My Board", lcmsMode: false } });

  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { email: "demo@example.com", name: "Demo Chair", orgId: org.id } });

  return { org, user };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { org } = await getOrCreate();

  if (req.method === "GET") {
    res.status(200).json({ id: org.id, name: org.name, lcmsMode: org.lcmsMode });
    return;
  }

  if (req.method === "POST") {
    const { name, lcmsMode } = req.body ?? {};
    const updated = await prisma.org.update({
      where: { id: org.id },
      data: { name: typeof name === "string" ? name : org.name, lcmsMode: Boolean(lcmsMode) },
    });
    res.status(200).json({ id: updated.id, name: updated.name, lcmsMode: updated.lcmsMode });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
