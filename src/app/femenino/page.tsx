import { SectionPage } from "@/components/section-page";
import SectionLoading from "@/components/section-loading";
import { Suspense } from "react";

export default function FemeninoPage() {
  return <Suspense fallback={<SectionLoading />}><SectionPage slug="femenino" /></Suspense>;
}
