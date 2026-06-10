import fs from "node:fs";
import path from "node:path";

const title = process.argv.slice(2).join(" ") || "Nouvel article SEO CorsaiManager";
const slug = slugify(title);
const date = new Date().toISOString().slice(0, 10);
const draftsDir = path.join(process.cwd(), "content", "blog", "drafts");
const filePath = path.join(draftsDir, `${slug}.md`);

fs.mkdirSync(draftsDir, { recursive: true });

if (fs.existsSync(filePath)) {
  console.error(`Le brouillon existe déjà : ${filePath}`);
  process.exit(1);
}

const draft = `---
title: "${title} | CorsaiManager"
description: "Résumé SEO de 150 à 160 caractères à compléter avant publication humaine."
date: "${date}"
author: "CorsaiManager"
category: "Intelligence artificielle"
tags: ["IA", "PME", "Corse"]
slug: "${slug}"
---

# ${title}

> Brouillon non publié. Ce fichier reste invisible tant qu'il est dans content/blog/drafts.

## Angle SEO

Décrire l'intention de recherche, le public cible, les mots-clés prioritaires et les liens internes à intégrer.

## Introduction

Rédiger une introduction simple, locale et professionnelle.

## Développement

Ajouter 1200 à 1500 mots avec des H2, H3, exemples concrets en Corse, liens internes et conseils actionnables.

## Liens internes à prévoir

- [Contact](/contact)
- [Intelligence artificielle en Corse](/intelligence-artificielle-corse)
- [Automatisation entreprise](/automatisation-entreprise)
- [CRM IA pour PME](/crm-ia-pme)

## FAQ

### Question spécifique à compléter ?

Réponse à compléter.

## CTA final

Inviter le lecteur à contacter CorsaiManager pour cadrer son projet IA.
`;

fs.writeFileSync(filePath, draft, "utf8");

console.log(`Brouillon créé : ${filePath}`);
console.log("Publication manuelle uniquement : relire, valider, puis déplacer le fichier vers content/blog/published.");

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
