import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

// Simple in-memory rate limiter (per IP, 5 per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please wait before sending another." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slug, name, email, message } = parsed.data;

    const supabase = await createClient();

    // Verify the portfolio exists and contact form is enabled
    const { data: settings } = await supabase
      .from("portfolio_settings")
      .select("show_contact_form, user_id")
      .eq("slug", slug)
      .single();

    if (!settings) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 },
      );
    }

    if (!settings.show_contact_form) {
      return NextResponse.json(
        { error: "Contact form is not enabled for this portfolio" },
        { status: 403 },
      );
    }

    // Store the message
    const { error } = await supabase.from("portfolio_contact_messages").insert({
      slug,
      sender_name: name,
      sender_email: email,
      message,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (err) {
    console.error("portfolio/contact POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
