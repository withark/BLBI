import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/server-user";
import { getBusinessProfile, upsertBusinessProfile } from "@/lib/store/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const profile = await getBusinessProfile(userId);
  return NextResponse.json({ profile });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  const payload = (await request.json()) as {
    businessName?: string;
    region?: string;
    address?: string;
    openingHours?: string;
    representativeMenus?: string[] | string;
    storeDescription?: string;
    facilities?: string;
    toneGuide?: string;
  };

  const businessName = payload.businessName?.trim();
  const region = payload.region?.trim();

  if (!businessName || !region) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "상호명과 지역은 필수입니다." },
      { status: 400 }
    );
  }

  const rawMenus = Array.isArray(payload.representativeMenus)
    ? payload.representativeMenus
    : (payload.representativeMenus || "").split(",");

  const representativeMenus = rawMenus.map((menu) => menu.trim()).filter(Boolean);

  const profile = await upsertBusinessProfile(userId, {
    businessName,
    region,
    address: payload.address?.trim() || "",
    openingHours: payload.openingHours?.trim() || "",
    representativeMenus,
    storeDescription: payload.storeDescription?.trim() || "",
    facilities: payload.facilities?.trim() || "",
    toneGuide: payload.toneGuide?.trim() || ""
  });

  return NextResponse.json({ profile });
}
