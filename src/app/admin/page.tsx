import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminBoard } from "./board";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login?next=/admin");

  const [orders, services, testimonials] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        code: true,
        name: true,
        email: true,
        whatsapp: true,
        campus: true,
        title: true,
        brief: true,
        attachmentUrl: true,
        urgency: true,
        deadline: true,
        budgetMin: true,
        budgetMax: true,
        status: true,
        quotedPrice: true,
        createdAt: true,
        serviceId: true,
        service: { select: { name: true } },
        events: {
          orderBy: { createdAt: "asc" },
          select: { status: true, note: true, createdAt: true },
        },
      },
    }),
    prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        category: true,
        priceFrom: true,
        turnaround: true,
        featured: true,
        active: true,
        sortOrder: true,
      },
    }),
    prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        role: true,
        quote: true,
        rating: true,
        published: true,
        sortOrder: true,
      },
    }),
  ]);

  const serialized = orders.map((o) => ({
    ...o,
    deadline: o.deadline?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    events: o.events.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
  }));

  return (
    <AdminBoard
      name={session.name}
      username={session.username}
      orders={serialized}
      services={services}
      testimonials={testimonials}
    />
  );
}
