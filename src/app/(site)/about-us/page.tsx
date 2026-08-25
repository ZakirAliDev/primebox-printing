import { AboutPage } from "@/components/AboutPage";

type AboutUsPageProps = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export const metadata = {
  title: "About Prime Box Printing",
  description:
    "Learn about Prime Box Printing — custom packaging, graphic design, and boxes from 100 units. Houston, TX and Canada.",
};

export default async function AboutUsPage({ searchParams }: AboutUsPageProps) {
  const params = await searchParams;
  return <AboutPage sent={params.sent === "1"} error={params.error === "1"} />;
}
