import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      description: true,
      category: true,
      priceFrom: true,
      turnaround: true,
      deliverables: true,
      featured: true,
    },
  });

  return NextResponse.json({ services });
}
