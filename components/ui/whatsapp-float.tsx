"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const prefilled = encodeURIComponent(
  "Bonjour, je souhaite échanger au sujet d’un audit IA pour mon entreprise."
);

export function WhatsAppFloat() {
  return (
    <motion.a
      href={`https://wa.me/33665018730?text=${prefilled}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter CorsaiManager sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/50 bg-gradient-to-br from-cyan-300 to-blue-400 text-zinc-950 shadow-[0_0_28px_rgba(34,211,238,0.5)] transition hover:scale-[1.04] sm:bottom-7 sm:right-7"
      animate={{ boxShadow: ["0 0 16px rgba(34,211,238,0.35)", "0 0 26px rgba(34,211,238,0.5)", "0 0 16px rgba(34,211,238,0.35)"] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <MessageCircle size={24} />
    </motion.a>
  );
}
