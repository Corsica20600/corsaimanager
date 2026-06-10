import Link from "next/link";
import Image from "next/image";
import { Clock3, Link2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_LINK, LINKEDIN_URL, WHATSAPP_URL } from "@/lib/contact";

const links = [
  { href: "/audit-ia", label: "Audit IA" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-zinc-950/85">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur">
          <Image src="/images/logo.png" alt="Logo CorsaiManager" className="h-12 w-auto brightness-110" width={170} height={48} />
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">CorsaiManager</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-400">Automatisation IA pour PME</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
            Réponse rapide garantie
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">Liens utiles</h3>
          <div className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-400">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:translate-x-0.5 hover:text-cyan-200">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:brightness-110"
            >
              Planifier un échange
            </Link>
            <Link
              href="/audit-ia"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
            >
              Audit IA gratuit
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 transition hover:text-cyan-200"><Mail size={16} /> {CONTACT_EMAIL}</a>
            <a href={`tel:${CONTACT_PHONE_LINK}`} className="flex items-center gap-2 transition hover:text-cyan-200"><Phone size={16} /> {CONTACT_PHONE_DISPLAY}</a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition hover:text-cyan-200"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition hover:text-cyan-200"
            >
              <Link2 size={16} /> LinkedIn
            </a>
            <p className="flex items-center gap-2"><Clock3 size={15} /> Lun-Ven: 9h-18h</p>
            <p className="flex items-center gap-2"><MapPin size={15} /> Corse / France</p>
            <p className="text-cyan-200">Réponse sous 24h</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>© {new Date().getFullYear()} CorsaiManager. Tous droits réservés.</span>
          {process.env.NODE_ENV !== "production" ? (
            <>
              <span className="text-zinc-700">•</span>
              <Link href="/admin" className="text-zinc-500 transition hover:text-cyan-200">
                Admin
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
