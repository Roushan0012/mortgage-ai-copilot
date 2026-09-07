import { NextResponse } from "next/server";
import { repository } from "@/lib/data/repository";

export async function POST() {
  repository.resetToSeed();
  return NextResponse.json({
    success: true,
    message: "Demo environment cleanly reset to seed state.",
    timestamp: new Date().toISOString(),
  });
}
