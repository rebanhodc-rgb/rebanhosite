import { Suspense } from "react";
import LaunchGate from "@/components/launch/LaunchGate";

export default function WaitlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <LaunchGate />
    </Suspense>
  );
}
