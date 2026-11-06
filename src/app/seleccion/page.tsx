import { SectionPage } from "@/components/section-page";
import SectionLoading from "@/components/section-loading";
import { Suspense } from "react";

export default function SeleccionPage() {
  return <Suspense fallback={<SectionLoading />}><SectionPage slug="seleccion" /></Suspense>;
}
