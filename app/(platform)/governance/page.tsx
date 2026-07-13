import type { Metadata } from "next";

import { GovernanceWorkspace } from "@/components/governance/governance-workspace";

export const metadata: Metadata = {
  title: "Data Governance",
};

export default function GovernancePage() {
  return <GovernanceWorkspace />;
}
