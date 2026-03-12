import type { UserPlan } from "@/lib/domain/types";

export const PLAN_LIMITS: Record<UserPlan, { limit: number | null; window: "daily" | "monthly" | "unlimited" }> = {
  FREE: { limit: 3, window: "daily" },
  BASIC: { limit: 15, window: "monthly" },
  PREMIUM: { limit: null, window: "unlimited" }
};

export const PLAN_DISPLAY: Record<UserPlan, { name: string; summary: string }> = {
  FREE: {
    name: "Free",
    summary: "하루 3편 생성으로 시작하는 체험 플랜"
  },
  BASIC: {
    name: "Basic",
    summary: "월 15편 생성으로 운영하는 실속 플랜"
  },
  PREMIUM: {
    name: "Premium",
    summary: "월 무제한 생성과 시리즈 기능을 포함한 성장 플랜"
  }
};

export const PRICING_CARDS: Array<{ plan: UserPlan; price: string; features: string[] }> = [
  {
    plan: "FREE",
    price: "0원 / 월",
    features: [
      "일 3회 블로그 글 생성",
      "가게 정보 반영",
      "사진 촬영 가이드 포함",
      "네이버 복붙용 순수 텍스트 출력"
    ]
  },
  {
    plan: "BASIC",
    price: "19,000원 / 월",
    features: [
      "월 15회 블로그 글 생성",
      "생성 히스토리 저장",
      "다음 글 추천 제공",
      "결과 편집 후 재저장"
    ]
  },
  {
    plan: "PREMIUM",
    price: "49,000원 / 월",
    features: [
      "월 무제한 블로그 글 생성",
      "시리즈 주제 한번에 생성",
      "추천 키워드 다양성 강화",
      "운영/관리 화면 사용"
    ]
  }
];

export function isSeriesAllowed(plan: UserPlan): boolean {
  return plan === "PREMIUM";
}

export function getLimitExceededMessage(plan: UserPlan): string {
  if (plan === "FREE") {
    return "오늘 생성 한도를 모두 사용했습니다. Basic 또는 Premium으로 업그레이드해 보세요.";
  }

  if (plan === "BASIC") {
    return "이번 달 생성 한도를 모두 사용했습니다. Premium으로 업그레이드하면 무제한으로 생성할 수 있습니다.";
  }

  return "사용량 정보를 확인하고 다시 시도해 주세요.";
}
