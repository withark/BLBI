import type { NextRequest } from "next/server";

export const DEMO_USER_ID = "demo-owner";

export function getUserIdFromRequest(request: NextRequest): string {
  return request.headers.get("x-user-id")?.trim() || DEMO_USER_ID;
}
