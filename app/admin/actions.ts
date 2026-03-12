"use server";

import { revalidatePath } from "next/cache";

import type { SeoReferenceStatus, UserPlan } from "@/lib/domain/types";
import {
  analyzeSeoReference,
  createSeoReference,
  setUserLimitBypass,
  setUserPlan,
  updateSeoReferenceStatus
} from "@/lib/store/db";

const PLAN_VALUES: UserPlan[] = ["FREE", "BASIC", "PREMIUM"];
const SEO_STATUS_VALUES: SeoReferenceStatus[] = ["candidate", "approved", "rejected", "archived"];

export async function toggleUserLimitBypassAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") || "").trim();
  const nextValue = String(formData.get("nextValue") || "").trim() === "true";

  if (!userId) {
    return;
  }

  await setUserLimitBypass(userId, nextValue);
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/usage");
  revalidatePath("/dashboard");
}

export async function setUserPlanAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") || "").trim();
  const plan = String(formData.get("plan") || "").trim() as UserPlan;

  if (!userId || !PLAN_VALUES.includes(plan)) {
    return;
  }

  await setUserPlan(userId, plan);
  revalidatePath("/admin");
  revalidatePath("/admin/subscription");
  revalidatePath("/admin/users");
  revalidatePath("/admin/usage");
}

export async function createSeoReferenceAction(formData: FormData): Promise<void> {
  const keyword = String(formData.get("keyword") || "").trim();
  const url = String(formData.get("url") || "").trim();

  if (!keyword || !url) {
    return;
  }

  await createSeoReference({
    keyword,
    region: String(formData.get("region") || "").trim(),
    businessType: String(formData.get("businessType") || "").trim(),
    url,
    title: String(formData.get("title") || "").trim(),
    summary: String(formData.get("summary") || "").trim(),
    sourceType: "manual",
    status: "candidate"
  });

  revalidatePath("/admin");
  revalidatePath("/admin/seo-references");
}

export async function updateSeoReferenceStatusAction(formData: FormData): Promise<void> {
  const referenceId = String(formData.get("referenceId") || "").trim();
  const status = String(formData.get("status") || "").trim() as SeoReferenceStatus;

  if (!referenceId || !SEO_STATUS_VALUES.includes(status)) {
    return;
  }

  await updateSeoReferenceStatus(referenceId, status);
  revalidatePath("/admin");
  revalidatePath("/admin/seo-references");
}

export async function analyzeSeoReferenceAction(formData: FormData): Promise<void> {
  const referenceId = String(formData.get("referenceId") || "").trim();

  if (!referenceId) {
    return;
  }

  await analyzeSeoReference(referenceId);
  revalidatePath("/admin");
  revalidatePath("/admin/seo-references");
}
