import type { Metadata } from "next";
import StayRulesManager from "@/components/admin/StayRulesManager";

export const metadata: Metadata = { title: "Stay rules — Admin" };
export default async function StayRulesPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  return (
    <StayRulesManager initialPropertyId={(await searchParams).propertyId} />
  );
}
