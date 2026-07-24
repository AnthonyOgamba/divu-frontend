import type { Metadata } from "next";
import { AggregatePage } from "@/components/dashboard/aggregate-page";

export const metadata: Metadata = {
  title: "Downtime | DIVU Analytics",
  description: "Downtime factors, active events, operational analytics, and AI insights.",
};

export default function Page() {
  return <AggregatePage kind="downtime" />;
}
