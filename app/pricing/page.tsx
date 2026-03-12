import Link from "next/link";

import { PLAN_DISPLAY, PRICING_CARDS } from "@/lib/domain/plan";

export default function PricingPage(): React.ReactNode {
  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ display: "grid", gap: "0.55rem" }}>
        <h1 style={{ fontSize: "1.45rem" }}>요금제</h1>
        <p className="help">각 플랜은 독립된 기능 설명으로 구성되어 있습니다.</p>
      </section>

      <section className="row">
        {PRICING_CARDS.map((card) => (
          <article key={card.plan} className="card" style={{ minWidth: "240px", display: "grid", gap: "0.6rem" }}>
            <h2 style={{ fontSize: "1.1rem" }}>{PLAN_DISPLAY[card.plan].name}</h2>
            <p className="help">{PLAN_DISPLAY[card.plan].summary}</p>
            <p style={{ fontWeight: 800 }}>{card.price}</p>
            <ul style={{ margin: 0, paddingLeft: "1rem", display: "grid", gap: "0.3rem" }}>
              {card.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link href="/billing" className="btn btn-primary" style={{ textAlign: "center" }}>
              선택하기
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
