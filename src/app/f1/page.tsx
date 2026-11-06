import { SectionPage } from "@/components/section-page";
import SectionLoading from "@/components/section-loading";
import { Suspense } from "react";

export default function F1Page() {
  return <Suspense fallback={<SectionLoading />}><SectionPage slug="f1" /></Suspense>;
}
