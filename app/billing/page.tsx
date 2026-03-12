import Link from "next/link";

export default function BillingPage(): React.ReactNode {
  return (
    <div style={{ display: "grid", gap: "0.9rem" }}>
      <section className="card" style={{ display: "grid", gap: "0.65rem" }}>
        <h1 style={{ fontSize: "1.45rem" }}>구독하기</h1>
        <div className="status">
          결제 연동 준비 중입니다. 현재는 설정 페이지에서 데모 플랜 전환으로 기능을 체험할 수 있습니다.
        </div>
        <div className="row">
          <Link href="/pricing" className="btn btn-secondary">
            요금제 다시 보기
          </Link>
          <Link href="/settings" className="btn btn-secondary">
            설정으로 이동
          </Link>
        </div>
      </section>
    </div>
  );
}
