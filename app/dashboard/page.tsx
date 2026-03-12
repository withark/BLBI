import { Suspense } from "react";

import { DashboardClient } from "./dashboard-client";

export default function DashboardPage(): React.ReactNode {
  return (
    <Suspense fallback={<div className="status">대시보드 로딩 중...</div>}>
      <DashboardClient />
    </Suspense>
  );
}
