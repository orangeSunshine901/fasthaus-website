import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase.rpc("read_white_friday_schedule").maybeSingle();
    if (error) throw error;
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("White Friday schedule could not be loaded", error);
    return NextResponse.json(null, { headers, status: 503 });
  }
}
