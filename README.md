This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Blog editorial

Le blog est volontairement semi-automatique : aucun brouillon n'est publié sans validation humaine.

- Écrire ou générer un article dans `content/blog/drafts`.
- Relire l'article, vérifier le SEO, les liens internes, la FAQ et le CTA.
- Publier uniquement après validation en déplaçant le fichier Markdown dans `content/blog/published`.
- Lancer `git add`, `git commit`, puis `git push`.
- Vercel déploie automatiquement, et l'article apparaît au prochain build.

Le site lit uniquement les fichiers présents dans `content/blog/published`. Les fichiers dans `content/blog/drafts` ne sont pas listés sur `/blog`, ne génèrent pas de route publique `/blog/[slug]` et ne sont pas ajoutés au sitemap.

### Publication automatique avec Git

Pour publier un article automatiquement après validation :

- Lancer `npm run watch:blog`.
- Déplacer l'article relu de `content/blog/drafts` vers `content/blog/published`.
- Le script attend 2 secondes, lance `npm run build`, puis exécute `git add`, `git commit` et `git push` si le build réussit.
- Si le build échoue, aucun commit n'est créé et l'erreur s'affiche dans le terminal.
- Vercel déploie ensuite automatiquement le site après le push.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
