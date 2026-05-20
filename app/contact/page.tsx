import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SharedPageHero } from "@/components/sections/shared-page-hero";
import { Container } from "@/components/ui/container";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_LINK, WHATSAPP_URL } from "@/lib/contact";

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
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
            >
              <p className="flex items-center gap-2 text-sm text-zinc-400"><Mail size={16} className="text-cyan-300" /> Email</p>
              <p className="mt-2 text-zinc-100 transition group-hover:text-cyan-100">{CONTACT_EMAIL}</p>
            </a>
            <a
              href={`tel:${CONTACT_PHONE_LINK}`}
              className="group rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
            >
              <p className="flex items-center gap-2 text-sm text-zinc-400"><Phone size={16} className="text-cyan-300" /> Téléphone</p>
              <p className="mt-2 text-zinc-100 transition group-hover:text-cyan-100">{CONTACT_PHONE_DISPLAY}</p>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-white/10 bg-zinc-900/70 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/[0.07] hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
            >
              <p className="flex items-center gap-2 text-sm text-zinc-400"><MessageCircle size={16} className="text-cyan-300" /> WhatsApp</p>
              <p className="mt-2 text-zinc-100 transition group-hover:text-cyan-100">Ouvrir la conversation</p>
            </a>
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-5 md:grid-cols-3">
            <p className="flex items-center gap-2 text-sm text-zinc-200"><Clock3 size={15} className="text-cyan-200" /> Lun-Ven: 9h-18h</p>
            <p className="flex items-center gap-2 text-sm text-zinc-200"><MapPin size={15} className="text-cyan-200" /> Corse / France</p>
            <p className="flex items-center gap-2 text-sm text-zinc-200"><MessageCircle size={15} className="text-cyan-200" /> Réponse sous 24h</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]"
            >
              Planifier un échange
            </a>
            <Link
              href="/audit-ia"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Audit IA gratuit
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
