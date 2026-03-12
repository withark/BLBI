import { PHOTO_GUIDE_MARKER, toExportText } from "@/lib/domain/export";
import type { GenerateInput, GeneratedPost } from "@/lib/domain/types";

interface KeywordBundle {
  regional: string[];
  menu: string[];
  situation: string[];
}

function firstMeaningful(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

export function buildNaverKeywordBundle(input: GenerateInput): KeywordBundle {
  const region = input.businessProfile?.region || "우리 동네";
  const menus = input.businessProfile?.representativeMenus || [];
  const keyword = input.keyword;
  const learnedKeywords = input.seoLearning?.keywordPatterns ?? [];

  return {
    regional: unique([keyword, `${region} 맛집`, `${region} 점심`, `${region} 저녁`, ...learnedKeywords.slice(0, 2)]),
    menu: unique([keyword, ...menus.map((menu) => `${menu} 추천`), ...menus.map((menu) => `${region} ${menu}`), ...learnedKeywords.slice(2, 4)]),
    situation: unique([`${region} 모임`, `${region} 회식`, `${region} 가족외식`, `${region} 데이트`])
  };
}

function buildToneLine(input: GenerateInput): string {
  const toneGuide = input.businessProfile?.toneGuide?.trim();
  const learnedTone = firstMeaningful(input.seoLearning?.tonePatterns[0]);

  if (toneGuide) {
    return `${toneGuide}라는 가게 문체 가이드를 우선 반영해 손님이 부담 없이 읽도록 구성합니다.`;
  }

  if (learnedTone) {
    return `${learnedTone} 톤이 상위노출 참고 패턴에서 자주 보이므로, 정보 전달을 앞세운 자연스러운 후기형 문장으로 맞춥니다.`;
  }

  const tone = input.tone;

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
  const learnedKeyword = firstMeaningful(input.seoLearning?.keywordPatterns[0]);

  if (region && businessName && learnedKeyword) {
    return `${learnedKeyword}, ${businessName} 방문 전에 먼저 확인할 포인트`;
  }

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
  const facilities = input.businessProfile?.facilities?.trim();

  return [
    `${businessName} 외관과 간판이 한 프레임에 들어오도록 거리에서 정면 샷으로 촬영해 주세요.`,
    `${menus[0] || "대표 메뉴"}의 단면과 재료가 보이게 45도 각도로 가까이 촬영해 주세요.`,
    `테이블 간격과 좌석 분위기가 보이도록 매장 내부를 넓게 촬영해 주세요.`,
    `${facilities || "주차, 예약, 단체석"} 정보가 있다면 해당 편의 요소가 보이게 입구나 안내 표기를 함께 담아 주세요.`
  ];
}

function buildNextSuggestions(keyword: string, bundle: KeywordBundle): string[] {
  const learned = bundle.menu.slice(1, 3);

  return unique([
    `${keyword} 점심 추천`,
    `${keyword} 저녁 모임`,
    bundle.menu[0],
    bundle.situation[0],
    `${keyword} 주차 되는 곳`,
    ...learned
  ]).slice(0, 4);
}

function buildSections(input: GenerateInput, bundle: KeywordBundle): Array<{ subtitle: string; body: string }> {
  const profile = input.businessProfile;
  const businessName = profile?.businessName || "매장";
  const region = profile?.region || "우리 동네";
  const openingHours = profile?.openingHours || "운영시간은 방문 전 확인";
  const facilities = profile?.facilities || "주차, 예약, 단체석 여부";
  const description = profile?.storeDescription || "동네 손님이 부담 없이 방문하기 좋은 분위기";
  const address = profile?.address || "";
  const menus = profile?.representativeMenus || [];
  const mainMenu = menus[0] || input.keyword;
  const supportingMenu = menus[1] || `${mainMenu}와 함께 주문하기 좋은 메뉴`;
  const details = input.details?.trim();
  const learnedSections = input.seoLearning?.sectionPatterns ?? [];
  const learnedKeyword = firstMeaningful(input.seoLearning?.keywordPatterns[0]);
  const learnedQualityNote =
    input.seoLearning && input.seoLearning.referenceCount > 0
      ? `승인된 상위노출 참고 ${input.seoLearning.referenceCount}건에서 자주 보인 구조를 반영해 문단 순서를 정리했습니다.`
      : null;

  const sections = [
    {
      subtitle: learnedSections[0] || `1. ${bundle.regional[0]}로 찾는 손님에게 먼저 보여줄 정보`,
      lines: [
        `${businessName}은(는) ${region}에서 ${bundle.regional[1] || bundle.regional[0]}를 찾는 손님이 가장 먼저 비교하는 후보로 설명하기 좋습니다.`,
        address
          ? `위치는 ${address} 기준으로 안내해 두면 길 찾기와 방문 동선을 함께 설명할 수 있습니다.`
          : `위치 안내는 ${region} 안에서 찾기 쉬운 동선 중심으로 설명하면 방문 전 이해가 빠릅니다.`,
        `${description}이라는 강점이 있어 처음 방문하는 손님에게도 선택 이유를 분명하게 전달할 수 있습니다.`,
        learnedKeyword ? `${learnedKeyword} 같은 검색 패턴을 함께 의식해 정보 순서를 앞쪽에 배치합니다.` : learnedQualityNote || "검색형 글 흐름에 맞게 핵심 정보를 먼저 배치합니다."
      ]
    },
    {
      subtitle: learnedSections[1] || "2. 대표 메뉴 선택과 주문 흐름",
      lines: [
        `${mainMenu}는 첫 방문 손님이 가장 쉽게 선택할 수 있는 대표 메뉴로 소개하기 좋습니다.`,
        `${supportingMenu}까지 함께 제안하면 주문 장면이 더 구체적으로 그려지고 후기형 문장도 자연스럽게 이어집니다.`,
        details
          ? `이번 글에는 '${details}' 요청도 반영해 메뉴 소개와 문장 순서를 실제 운영 상황에 맞게 조정합니다.`
          : `추가 요청사항이 없으므로 메뉴 설명은 초보 손님도 이해하기 쉬운 순서로 단순하게 정리합니다.`
      ]
    },
    {
      subtitle: learnedSections[2] || "3. 매장 분위기와 방문 상황별 안내",
      lines: [
        `${bundle.situation[0]}이나 ${bundle.situation[1]} 같은 상황을 먼저 짚어 주면 손님이 자기 방문 목적에 맞게 글을 읽게 됩니다.`,
        `${facilities} 정보는 검색 사용자가 자주 확인하는 포인트라 본문 중간에 자연스럽게 섞어 주는 편이 좋습니다.`,
        `${buildToneLine(input)}`
      ]
    },
    {
      subtitle: learnedSections[3] || "4. 방문 전 체크와 재방문 유도",
      lines: [
        `방문 전 체크 포인트를 짧게 정리하면 ${bundle.regional[3] || bundle.regional[0]} 검색에서 이탈을 줄이고 행동으로 이어지기 쉽습니다.`,
        `${openingHours} 기준 안내를 넣고, 변동 가능성이 있으면 방문 전 재확인을 권하는 문장을 함께 두는 편이 안전합니다.`,
        `${businessName}의 강점과 다시 방문할 이유를 한 문단으로 마무리하면 검색형 글과 후기형 글 사이 균형을 맞추기 좋습니다.`
      ]
    }
  ];

  return sections.map((section) => {
    return {
      subtitle: section.subtitle,
      body: repeatLines(section.lines, paragraphLengthMultiplier(input.length)).join("\n")
    };
  });
}

function buildFaq(input: GenerateInput, bundle: KeywordBundle): string {
  if (!input.includeFaq) {
    return "";
  }

  const businessName = input.businessProfile?.businessName || "매장";
  const openingHours = input.businessProfile?.openingHours || "영업시간";
  const facilities = input.businessProfile?.facilities || "주차, 예약, 단체석";

  return [
    "자주 묻는 질문",
    `Q. ${bundle.regional[0]} 방문 전에 꼭 확인할 점이 있나요?`,
    `A. ${openingHours}과 혼잡 시간을 먼저 확인하면 대기 시간을 줄일 수 있습니다.`,
    `Q. ${bundle.menu[0] || input.keyword} 메뉴는 처음 방문해도 괜찮나요?`,
    "A. 대표 메뉴 중심으로 주문하면 실패 확률이 낮고 후기 작성도 쉬워집니다.",
    "Q. 단체 방문도 가능한가요?",
    `A. ${businessName}의 ${facilities} 여부는 변동될 수 있으니 단체 인원은 사전 문의를 권장합니다.`
  ].join("\n");
}

function buildCta(input: GenerateInput): string {
  const profile = input.businessProfile;
  const learnedCta = firstMeaningful(input.seoLearning?.ctaPatterns[0]);

  if (!profile) {
    return learnedCta || "방문 전 영업시간과 위치를 확인하고, 오늘의 대표 메뉴로 가볍게 시작해 보세요.";
  }

  if (learnedCta) {
    return `${profile.businessName}은(는) ${profile.region} 기준으로 찾기 쉬운 위치에 있습니다. ${learnedCta}`;
  }

  return `${profile.businessName}은(는) ${profile.region}에서 찾기 쉬운 위치에 있습니다. 방문 전 ${profile.openingHours}를 확인하고 편하게 들러 보세요.`;
}

export function generatePost(input: GenerateInput): GeneratedPost {
  const bundle = buildNaverKeywordBundle(input);
  const title = buildTitle(input);
  const photoGuides = buildPhotoGuides(input);
  const sections = buildSections(input, bundle);
  const sectionBlocks = sections.map((section, index) => {
    const guide = photoGuides[index] || photoGuides[photoGuides.length - 1];

    return [section.subtitle, section.body, `${PHOTO_GUIDE_MARKER} ${guide}`].join("\n");
  });

  const faq = buildFaq(input, bundle);
  const cta = buildCta(input);
  const body = sectionBlocks.join("\n\n");
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
