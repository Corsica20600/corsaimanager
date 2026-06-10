/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = process.cwd();
const publishedDir = path.join(projectRoot, "content", "blog", "published");
const debounceMs = 2000;
const timers = new Map();
const queue = [];
let running = false;

const requestedGitAddPaths = [
  "content/blog/published",
  "sitemap.xml",
  "package.json",
  "package-lock.json",
  "src",
  "app",
  "content",
];

fs.mkdirSync(publishedDir, { recursive: true });

console.log(`Surveillance des articles publiés : ${publishedDir}`);
console.log("Déplacez un fichier .md ou .mdx dans ce dossier pour lancer build, commit et push.");

fs.watch(publishedDir, (eventType, fileName) => {
  if (!fileName || !isMarkdown(fileName)) {
    return;
  }

  const filePath = path.join(publishedDir, fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const key = path.basename(fileName);
  clearTimeout(timers.get(key));
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      queue.push({ eventType, fileName: key });
      processQueue();
    }, debounceMs)
  );
});

function processQueue() {
  if (running) {
    return;
  }

  const next = queue.shift();

  if (!next) {
    return;
  }

  running = true;

  try {
    publishArticle(next.fileName);
  } finally {
    running = false;
    processQueue();
  }
}

function publishArticle(fileName) {
  console.log(`\nArticle détecté : ${fileName}`);
  console.log("Lancement du build...");

  const build = run("npm", ["run", "build"], { shell: true });

  if (build.status !== 0) {
    console.error("Build échoué. Aucun commit ne sera créé.");
    if (build.stderr) {
      console.error(build.stderr);
    }
    return;
  }

  const existingPaths = requestedGitAddPaths.filter((item) => fs.existsSync(path.join(projectRoot, item)));

  if (existingPaths.length === 0) {
    console.log("Aucun chemin existant à ajouter avec git add.");
    return;
  }

  console.log(`git add ${existingPaths.join(" ")}`);
  const gitAdd = run("git", ["add", ...existingPaths]);

  if (gitAdd.status !== 0) {
    console.error("git add a échoué. Aucun commit ne sera créé.");
    if (gitAdd.stderr) {
      console.error(gitAdd.stderr);
    }
    return;
  }

  const status = run("git", ["status", "--porcelain"]);

  if (status.status !== 0) {
    console.error("Impossible de lire git status. Aucun commit ne sera créé.");
    if (status.stderr) {
      console.error(status.stderr);
    }
    return;
  }

  if (!status.stdout.trim()) {
    console.log("Aucun changement à committer.");
    return;
  }

  const commitMessage = `Publication article blog: ${fileName}`;
  console.log(`git commit -m "${commitMessage}"`);
  const commit = run("git", ["commit", "-m", commitMessage]);

  if (commit.status !== 0) {
    console.error("git commit a échoué. git push ne sera pas lancé.");
    if (commit.stderr) {
      console.error(commit.stderr);
    }
    return;
  }

  console.log("git push");
  const push = run("git", ["push"]);

  if (push.status !== 0) {
    console.error("git push a échoué.");
    if (push.stderr) {
      console.error(push.stderr);
    }
    return;
  }

  console.log("Article publié, commit créé et push terminé.");
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
    shell: options.shell ?? false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function isMarkdown(fileName) {
  return fileName.endsWith(".md") || fileName.endsWith(".mdx");
}
