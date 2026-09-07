import { NextResponse } from "next/server";
import { getWhatsappNumbers } from "@/lib/whatsapp";

export const revalidate = 300;

export async function GET() {
  const numbers = await getWhatsappNumbers();
  return NextResponse.json({ numbers });
}
