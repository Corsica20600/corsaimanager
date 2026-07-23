import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Demande d'audit IA envoyée",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const whatsappMessage = encodeURIComponent(
  "Bonjour, je souhaite échanger au sujet d’un audit IA."
);
const whatsappUrl = `https://wa.me/33665018730?text=${whatsappMessage}`;

export default function AuditSuccessPage() {
  return (
    <div className="relative overflow-hidden pb-20 pt-16 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.14]" />

      <Container>
        <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-900/60 p-7 text-center shadow-[0_0_60px_rgba(34,211,238,0.16)] backdrop-blur sm:p-10">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 text-emerald-300 shadow-[0_0_30px_rgba(110,231,183,0.25)]">
            <CheckCircle2 size={34} />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Votre demande a bien été envoyée
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Nous revenons vers vous rapidement avec une première qualification et
            une proposition de créneau.
          </p>
          <p className="mt-3 text-sm font-medium text-cyan-200">
            Réponse habituelle sous 24 heures ouvrées
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_0_rgba(34,211,238,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
            >
              <MessageCircle size={16} />
              Échanger sur WhatsApp
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200 hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]"
            >
              Retour à l’accueil
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
