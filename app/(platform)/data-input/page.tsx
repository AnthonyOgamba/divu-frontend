import type { Metadata } from "next";
import { BackendFeatureUnavailable } from "@/components/ui/backend-feature-unavailable";

export const metadata: Metadata = {
  title: "Data Input | DIVU Analytics",
  description: "Secure industrial telemetry ingestion, validation, data quality, and source management.",
};

export default function Page() {
  return <BackendFeatureUnavailable title="Data Input and imports" />;
}
