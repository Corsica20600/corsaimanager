import type { Metadata } from "next";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez CorsaiManager pour lancer votre transformation IA.",
};

export default function ContactPage() {
  return (
    <div className="pb-20">
      <SharedPageHero
        badge="Contact"
        title="Parlons de votre prochain levier de croissance IA"
        description="Partagez vos objectifs commerciaux et opérationnels. Nous revenons vers vous avec un cadrage clair et actionnable."
      />
      <Container>
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-400">Email</p>
              <p className="mt-1 text-zinc-100">contact@corsaimanager.fr</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-5">
              <p className="text-sm text-zinc-400">Téléphone</p>
              <p className="mt-1 text-zinc-100">+33 6 65 01 87 30</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
