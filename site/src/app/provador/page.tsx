import type { Metadata } from "next";
import VirtualTryOn from "@/components/tryon/VirtualTryOn";

export const metadata: Metadata = {
  title: "Provador Virtual | REBANHO",
  description:
    "Suba uma foto e veja como cada peça REBANHO fica em você, com inteligência artificial.",
};

export default function ProvadorPage() {
  return <VirtualTryOn />;
}
