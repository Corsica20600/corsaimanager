import { ReactNode } from "react";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

export function SharedPageHero({
  badge,
  title,
  description,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="pt-16 sm:pt-20">
      <Container>
        <AnimatedReveal>
          <Pill>{badge}</Pill>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300 sm:text-lg">{description}</p>
          {children ? <div className="mt-10">{children}</div> : null}
        </AnimatedReveal>
      </Container>
    </section>
  );
}
