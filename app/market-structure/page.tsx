import { IndexPage } from "@/components/index-page";
export const metadata = { title: "Market Structure" };
export default function MarketStructure() {
  return (
    <IndexPage
      title="Market Structure"
      description="Study displacement, imbalances, and the context behind a directional price move."
      marketOnly
    />
  );
}
