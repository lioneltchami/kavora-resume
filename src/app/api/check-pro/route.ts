import { NextResponse } from "next/server";
import { checkUserPro } from "@/lib/check-pro";

export async function GET() {
  const { isPro } = await checkUserPro();
  return NextResponse.json({ isPro });
}
