import type { Metadata } from "next";

import { BackendFeatureUnavailable } from "@/components/ui/backend-feature-unavailable";

export const metadata: Metadata = {
  title: "Data Governance",
};

export default function GovernancePage() {
  return <BackendFeatureUnavailable title="Data Governance" />;
}
