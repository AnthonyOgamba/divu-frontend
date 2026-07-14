import type { Metadata } from "next";

import { AssetsPage } from "@/components/assets/assets-page";

export const metadata: Metadata = {
  title: "Assets",
  description: "Industrial asset registry for machines, controllers, and production equipment.",
};

export default function AssetsRoute() {
  return <AssetsPage />;
}
