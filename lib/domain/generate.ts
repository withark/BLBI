import { PHOTO_GUIDE_MARKER, toExportText } from "@/lib/domain/export";
import type { GenerateInput, GeneratedPost } from "@/lib/domain/types";

interface KeywordBundle {
  regional: string[];
  menu: string[];
  situation: string[];
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

export function buildNaverKeywordBundle(input: GenerateInput): KeywordBundle {
  const region = input.businessProfile?.region || "우리 동네";
  const menus = input.businessProfile?.representativeMenus || [];
  const keyword = input.keyword;

  return {
    regional: unique([keyword, `${region} 맛집`, `${region} 점심`, `${region} 저녁`]),
    menu: unique([keyword, ...menus.map((menu) => `${menu} 추천`), ...menus.map((menu) => `${region} ${menu}`)]),
    situation: unique([`${region} 모임`, `${region} 회식`, `${region} 가족외식`, `${region} 데이트`])
  };
}

function buildToneLine(tone: GenerateInput["tone"]): string {
  if (tone === "professional") {
    return "사장님이 직접 안내하는 것처럼 신뢰감 있게, 정보는 정확하고 간결하게 전달합니다.";
  }

  if (tone === "warm") {
    return "처음 방문하는 손님도 편하게 느끼도록 따뜻한 후기 톤으로 설명합니다.";
  }

  return "주민에게 추천해 주는 친근한 말투로 부담 없이 읽히게 구성합니다.";
}

function buildTitle(input: GenerateInput): string {
  const region = input.businessProfile?.region?.trim();
  const businessName = input.businessProfile?.businessName?.trim();

  if (region && businessName) {
    return `${region} ${input.keyword}, ${businessName} 방문 전 꼭 보면 좋은 가이드`;
  }

  if (region) {
    return `${region} ${input.keyword} 제대로 즐기는 방법`;
  }

  return `${input.keyword} 검색에 잘 맞는 매장 소개 글`;
}

function paragraphLengthMultiplier(length: GenerateInput["length"]): number {
  if (length === "short") {
    return 1;
  }

  if (length === "medium") {
    return 1.3;
  }

  return 1.7;
}

function repeatLines(lines: string[], multiplier: number): string[] {
  if (multiplier <= 1) {
    return lines;
  }

  const extraCount = Math.ceil((multiplier - 1) * 2);
  return [...lines, ...lines.slice(0, extraCount)];
}

function buildPhotoGuides(input: GenerateInput): string[] {
  const businessName = input.businessProfile?.businessName || "매장";
  const menus = input.businessProfile?.representativeMenus || [];

  return [
    `${businessName} 외관과 간판이 한 프레임에 들어오도록 거리에서 정면 샷으로 촬영해 주세요.`,
    `${menus[0] || "대표 메뉴"}의 단면과 재료가 보이게 45도 각도로 가까이 촬영해 주세요.`,
    `테이블 간격과 좌석 분위기가 보이도록 매장 내부를 넓게 촬영해 주세요.`,
    `식사 전후 손님 동선이 자연스럽게 보이도록 카운터 주변을 짧게 기록해 주세요.`
  ];
}

function buildNextSuggestions(keyword: string, bundle: KeywordBundle): string[] {
  return unique([
    `${keyword} 점심 추천`,
    `${keyword} 저녁 모임`,
    bundle.menu[0],
    bundle.situation[0],
    `${keyword} 주차 되는 곳`
  ]).slice(0, 4);
}

function buildSections(input: GenerateInput, bundle: KeywordBundle): Array<{ subtitle: string; body: string }> {
  const profile = input.businessProfile;
  const businessName = profile?.businessName || "매장";
  const openingHours = profile?.openingHours || "운영시간 정보는 방문 전 확인";
  const facilities = profile?.facilities || "편의 정보는 매장 문의 시 가장 정확";
  const description = profile?.storeDescription || "동네 손님이 부담 없이 방문하기 좋은 분위기";
  const details = input.details?.trim();

  const sections = [
    {
      subtitle: `1. ${bundle.regional[0]}에서 이 매장을 먼저 확인해야 하는 이유`,
      lines: [
        `${businessName}은(는) ${bundle.regional[1] || bundle.regional[0]}를 찾는 손님에게 위치와 접근성이 좋아 첫 방문 장벽이 낮습니다.`,
        `검색에서 자주 찾는 ${bundle.regional[2] || bundle.regional[0]} 흐름에 맞춰 방문 포인트를 정리하면 선택이 빨라집니다.`,
        `${description}이라는 장점이 있어 재방문을 고민하는 손님에게도 설득력이 있습니다.`
      ]
    },
    {
      subtitle: "2. 대표 메뉴 선택 팁과 주문 동선",
      lines: [
        `${bundle.menu[0] || input.keyword} 관련 메뉴는 처음 방문한 손님이 체감 만족도를 높이기 좋은 선택입니다.`,
        `${bundle.menu[1] || "대표 메뉴"}와 함께 곁들이면 맛의 균형이 좋아지고, 주문 동선도 간단해집니다.`,
        `특히 피크 시간대에는 미리 메뉴를 정해 두면 대기 시간을 줄일 수 있습니다.`
      ]
    },
    {
      subtitle: "3. 매장 분위기와 방문 상황별 추천",
      lines: [
        `${bundle.situation[0]}이나 ${bundle.situation[1]} 상황에서 좌석 선택 기준을 먼저 안내하면 방문 만족도가 높습니다.`,
        `${facilities} 같은 정보는 검색 사용자가 가장 궁금해하는 포인트라 본문에 자연스럽게 포함하는 것이 좋습니다.`,
        `가볍게 식사하려는 손님과 오래 머무는 손님을 나눠 안내하면 글의 실용성이 좋아집니다.`
      ]
    },
    {
      subtitle: "4. 재방문으로 이어지는 마무리 안내",
      lines: [
        `방문 전 체크 포인트를 간단히 정리해 두면 ${bundle.regional[3] || bundle.regional[0]} 검색에서 이탈을 줄일 수 있습니다.`,
        `영업시간은 ${openingHours} 기준으로 안내하고, 변동이 생기면 최신 정보로 업데이트하는 것이 좋습니다.`,
        `마지막 문단에서는 손님이 바로 행동할 수 있도록 방문 동기와 기대 포인트를 짧게 제시해 주세요.`
      ]
    }
  ];

  return sections.map((section) => {
    const base = repeatLines(section.lines, paragraphLengthMultiplier(input.length));
    const detailLine = details
      ? `사장님 추가 요청사항(${details})을 반영해 문장 톤과 정보 순서를 조정했습니다.`
      : "추가 요청사항이 없어 기본 운영 관점에서 읽기 쉬운 순서로 정리했습니다.";

    return {
      subtitle: section.subtitle,
      body: [...base, detailLine].join("\n")
    };
  });
}

function buildFaq(input: GenerateInput, bundle: KeywordBundle): string {
  if (!input.includeFaq) {
    return "";
  }

  return [
    "자주 묻는 질문",
    `Q. ${bundle.regional[0]} 방문 전에 꼭 확인할 점이 있나요?`,
    "A. 영업시간과 혼잡 시간을 먼저 확인하면 대기 시간을 줄일 수 있습니다.",
    `Q. ${bundle.menu[0] || input.keyword} 메뉴는 처음 방문해도 괜찮나요?`,
    "A. 대표 메뉴 중심으로 주문하면 실패 확률이 낮고 후기 작성도 쉬워집니다.",
    "Q. 단체 방문도 가능한가요?",
    "A. 단체 인원은 사전 문의를 권장하며 좌석/주차 조건은 매장 정책에 따라 달라집니다."
  ].join("\n");
}

function buildCta(input: GenerateInput): string {
  const profile = input.businessProfile;

  if (!profile) {
    return "방문 전 영업시간과 위치를 확인하고, 오늘의 대표 메뉴로 가볍게 시작해 보세요.";
  }

  return `${profile.businessName}은(는) ${profile.region}에서 찾기 쉬운 위치에 있습니다. 방문 전 ${profile.openingHours}를 확인하고 편하게 들러 보세요.`;
}

export function generatePost(input: GenerateInput): GeneratedPost {
  const bundle = buildNaverKeywordBundle(input);
  const title = buildTitle(input);
  const intro = [
    `${input.keyword}로 검색해 들어온 손님이 가장 궁금해하는 정보부터 빠르게 정리했습니다.`,
    buildToneLine(input.tone)
  ].join("\n");

  const photoGuides = buildPhotoGuides(input);
  const sections = buildSections(input, bundle);
  const sectionBlocks = sections.map((section, index) => {
    const guide = photoGuides[index] || photoGuides[photoGuides.length - 1];

    return [section.subtitle, section.body, `${PHOTO_GUIDE_MARKER} ${guide}`].join("\n");
  });

  const closing = [
    "마무리",
    `${input.keyword} 관련 검색에서는 정보가 빠르고 명확할수록 체류시간이 늘어나는 경향이 있습니다.`,
    "오늘 글을 기반으로 실제 방문 후기를 한두 문단 추가하면 더 자연스럽고 신뢰도 높은 콘텐츠가 됩니다."
  ].join("\n");

  const faq = buildFaq(input, bundle);
  const cta = buildCta(input);

  const body = [intro, ...sectionBlocks, closing].join("\n\n");
  const exportText = toExportText({ title, body, faq, cta });

  return {
    title,
    body,
    faq,
    cta,
    exportText,
    nextSuggestions: buildNextSuggestions(input.keyword, bundle)
  };
}

export function generateSeriesTopics(keyword: string, region = "우리 동네"): string[] {
  return [
    `${region} ${keyword} 점심 추천 코스`,
    `${region} ${keyword} 저녁 모임 가이드`,
    `${region} ${keyword} 비 오는 날 방문 팁`,
    `${region} ${keyword} 가족외식 메뉴 조합`,
    `${region} ${keyword} 주차/예약 정리`,
    `${region} ${keyword} 재방문 손님 후기형 글`
  ];
}

export function rewriteBody(body: string, mode: "rewrite" | "short" | "long"): string {
  if (mode === "short") {
    return body
      .split("\n")
      .filter((line, index) => index % 2 === 0 || line.includes(PHOTO_GUIDE_MARKER))
      .join("\n")
      .trim();
  }

  if (mode === "long") {
    const extra = "\n\n추가 안내\n방문 시간대별 메뉴 선택과 좌석 선택 팁을 함께 기록하면 검색 유입 후 체류 시간이 더 좋아집니다.";
    return `${body.trim()}${extra}`;
  }

  return body
    .replace(/좋습니다/g, "도움이 됩니다")
    .replace(/추천합니다/g, "권장합니다")
    .trim();
}
