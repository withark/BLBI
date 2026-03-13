# 관리자 SEO 학습/자동 수집 고도화 계획

## 1. 기준

- 원본 설계 문서 `/Users/oners/Desktop/@블비/project-master-spec.md` 기준
- 특히 아래 요구를 현재 프로젝트의 관리자 고도화 기준으로 삼는다.
  - 관리자 메뉴 확장: `/admin`, `/admin/users`, `/admin/subscription`, `/admin/posts`, `/admin/usage`, `/admin/seo-references`
  - 상위노출 참고 URL 관리
  - 참고 URL 분석 후 `SeoLearnedSnapshot` 형태로 학습 결과 저장
  - 글 생성 시 학습된 경쟁 분석 결과를 전략/본문에 반영

## 2. 결론

- 상위노출 분석은 `수동만 가능한 구조`로 묶을 필요는 없다.
- 다만 `완전 무제한 자동 크롤링`은 운영 정책/품질/노이즈 측면에서 위험하다.
- 가장 현실적인 구조는 `반자동 + 승인형 자동화`다.

권장 운영 방식:

1. 자동 후보 수집
2. 관리자 승인/제외
3. 승인된 URL만 정기 재분석
4. 분석 결과는 원문 저장이 아니라 `학습 스냅샷`으로 저장
5. 생성 엔진은 스냅샷만 읽어 프롬프트에 반영

## 3. 왜 완전 자동 크롤링만으로 가면 안 되는가

### 3.1 정책 리스크

- 네이버 공식 검색 API와 데이터랩 API를 사용할 수 있지만, 검색 결과 원문 저장/재가공 범위는 실제 적용 전 약관과 운영 정책을 다시 확인해야 한다.
- 따라서 초기 구조는 검색 API 응답 원문을 장기 저장하기보다, 보수적으로 `분석 후 파생된 지표`만 저장하는 방식이 안전하다.
- 저장의 중심은 `원문 응답`이 아니라 `분석 후 파생된 지표`로 두는 것이 좋다.

### 3.2 품질 리스크

- 상위 노출 글이라고 해서 모두 학습 가치가 높은 것은 아니다.
- 체험단/광고성 문구, 지역 불일치, 업종 불일치, 오래된 포스트가 많이 섞인다.
- 완전 자동 수집만 쓰면 생성 엔진이 저품질 패턴을 학습할 위험이 크다.

### 3.3 운영 리스크

- 본문 fetch 실패, robots 제한, 마크업 변경, 모바일/PC 버전 차이 등으로 수집 품질이 불안정하다.
- 결국 운영자는 "이 URL을 학습해도 되는지"를 통제할 수 있어야 한다.

## 4. 추천 구조: 수동 / 반자동 / 자동

### 4.1 1단계: 수동 등록

관리자가 직접 등록:

- 키워드
- 업종
- 지역
- 참고 URL
- 왜 참고하는지 메모

장점:

- 품질 제어가 가장 좋음
- 초기 MVP에서 가장 안전함
- 잘못된 학습을 막기 쉽다

단점:

- 운영자가 직접 수집해야 해서 시간이 든다

### 4.2 2단계: 반자동 후보 수집

공식 API를 사용해 후보만 자동으로 모은다.

후보 수집 소스:

- Naver Search API `blog`, `webkr`, `local`
- Naver Datalab 검색어 트렌드

자동 수집이 하는 일:

- 키워드별 상위 후보 URL/제목/설명 임시 조회
- 지역 키워드와 결합한 후보군 추출
- 최근 검색 추이 상승 키워드 감지
- 관리 화면에 "검토 필요 후보"로 쌓기

관리자가 하는 일:

- 채택
- 제외
- 보류

이 구조가 가장 현실적이다.

현재 구현 상태:

- `/admin/seo-references`에서 수동 참고 URL 등록 가능
- 내부 데이터 기반 후보 생성 버튼 구현
- `/admin/seo-references/candidates`에서 후보 전용 검토 가능
- `/admin/seo-learning`에서 누적 패턴 요약 확인 가능
- `/admin/jobs`에서 후보 생성/분석 작업 로그 확인 가능
- 생성 엔진이 승인된 학습 스냅샷을 실제로 반영하도록 연결 완료

### 4.3 3단계: 승인된 URL 정기 재분석

승인된 URL만 대상으로:

- 매일 또는 매주 재수집
- 구조 변화 감지
- 핵심 패턴 재학습

이 단계부터는 사실상 자동 운영에 가깝지만, 입력 풀 자체는 관리자가 통제한다.

## 5. 관리자 페이지에 추가할 기능

## 5.1 `/admin/seo-references`

목적:

- 상위노출 참고 URL을 등록/승인/분석/보관하는 핵심 관리자 화면

필수 기능:

- 참고 URL 등록
- 키워드, 지역, 업종 태깅
- 상태값: `candidate`, `approved`, `rejected`, `archived`
- 마지막 분석 시각
- 최근 분석 결과 요약
- "지금 다시 분석" 버튼

## 5.2 `/admin/seo-references/candidates`

목적:

- 자동 후보 수집 결과를 검토하는 화면

필수 기능:

- 자동 수집된 후보 리스트
- 소스 표시: `search-api`, `manual`, `imported`
- 제목/설명/링크/추정 지역/추정 업종
- 승인 / 제외 / 보류

## 5.3 `/admin/seo-learning`

목적:

- URL 단위가 아니라 "학습된 패턴"을 보는 화면

필수 기능:

- 자주 등장하는 제목 패턴
- 소제목 구조 패턴
- CTA 패턴
- 사진 가이드 패턴
- 지역/메뉴/상황 키워드 조합 패턴
- 최근 학습 반영 시각

## 5.4 `/admin/ranking-watch`

목적:

- 특정 키워드 묶음에 대해 관찰 대상 상태를 보는 화면

필수 기능:

- 키워드 그룹 등록
- 지역/메뉴/상황 키워드 세트
- 최근 후보 수
- 최근 승인 URL 수
- 최근 학습 스냅샷 수
- 트렌드 지표 변화

## 5.5 `/admin/jobs`

목적:

- 자동 수집/재분석 작업 상태를 보는 운영 화면

필수 기능:

- 최근 수집 잡
- 최근 분석 잡
- 성공/실패
- 실패 사유
- 수동 재실행

## 6. 저장 전략

원문을 길게 저장하지 말고, 분석 결과만 저장한다.

추천 테이블 구조:

### `seo_reference_sources`

- `id`
- `source_type` (`manual`, `search_api`, `import`)
- `keyword`
- `region`
- `business_type`
- `url`
- `title`
- `status`
- `created_at`
- `updated_at`

### `seo_reference_snapshots`

- `id`
- `reference_id`
- `fetched_at`
- `heading_count`
- `photo_guide_count`
- `faq_exists`
- `cta_exists`
- `avg_paragraph_length`
- `keyword_patterns`
- `section_patterns`
- `cta_patterns`
- `tone_patterns`
- `freshness_score`
- `quality_score`
- `notes`

### `seo_learned_rules`

- `id`
- `keyword_family`
- `region`
- `business_type`
- `rule_type` (`title`, `section`, `cta`, `photo`, `tone`)
- `rule_payload`
- `confidence`
- `source_snapshot_ids`
- `created_at`

핵심:

- 저장의 중심은 `URL 원문`이 아니라 `분석된 규칙과 지표`
- 생성 엔진은 `seo_learned_rules`만 읽어도 충분해야 한다

## 7. 자동 수집 가능한 부분

자동화 가능한 것:

1. 키워드별 후보 URL 검색
2. 지역 키워드 확장
3. 트렌드 상승 키워드 탐지
4. 승인된 참고 URL 정기 재분석
5. 스냅샷 비교 후 규칙 업데이트
6. 관리자 알림 생성

자동화하기 애매한 것:

1. 어떤 URL이 진짜 학습 가치가 높은지 최종 판단
2. 광고성/낚시성 글 제외
3. 법적/정책적으로 민감한 수집 범위 결정

즉, 자동화는 가능하지만 `최종 승인`은 관리자가 잡는 구조가 맞다.

## 8. 공식 API 기준으로 가능한 범위

공식 문서 기준:

- Naver Search API는 블로그/웹문서/지역 등 검색 결과 조회를 지원한다.
- Search API 호출 한도는 하루 25,000회다.
- Naver Datalab 검색어 트렌드 API는 검색 추이 분석을 지원한다.
- Datalab 검색어 트렌드 API 호출 한도는 하루 1,000회다.

활용 방식:

- Search API: "무슨 URL을 볼지" 후보 수집
- Datalab: "무슨 키워드가 올라오는지" 우선순위 조정
- 관리자 승인: "무엇을 실제 학습할지" 확정

## 9. 현재 프로젝트에 반영할 구현 순서

### 1차

- 현재 `/admin` 대시보드 유지
- `/admin/seo-references` 추가
- 참고 URL 수동 등록/상태 관리
- 분석 스냅샷 저장 구조 추가

### 2차

- Search API 기반 후보 수집 잡 추가
- 후보 승인 화면 추가
- Datalab 기반 상승 키워드 감지 추가

### 3차

- 승인된 URL 정기 재분석 잡 추가
- 학습 규칙 집계 화면 추가
- 생성 엔진에 규칙 반영 강도 옵션 추가

### 4차

- 지역/업종별 학습 모델 분리
- 성과 측정: 클릭, 저장, 재생성, 복사 후 수정률 기반 품질 피드백 반영

## 10. 최종 권장안

운영적으로 가장 맞는 방향:

- `수동만`으로 가지 않는다
- `완전 자동 크롤링`으로도 가지 않는다
- `자동 후보 수집 + 관리자 승인 + 승인 URL 정기 재분석` 구조로 간다

이 구조가:

- 정책 리스크를 줄이고
- 품질을 유지하고
- 실제 운영 시간을 줄이고
- 생성 엔진을 지속적으로 고도화하기 가장 좋다

## 11. 참고 링크

- Naver Search API 소개: https://developers.naver.com/products/service-api/search/search.md
- Naver Search API 웹문서 검색: https://developers.naver.com/docs/serviceapi/search/web/web.md
- Naver OpenAPI FAQ: https://developers.naver.com/products/intro/faq/faq.md
- Naver Datalab 소개: https://developers.naver.com/products/service-api/datalab/datalab.md
- Naver Datalab 검색어 트렌드: https://developers.naver.com/docs/serviceapi/datalab/search/search.md
