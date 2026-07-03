/**
 * Post-build script: generates a static index.html from the Vite client build
 * output for deployment to Hostinger (static hosting).
 */
import { readdirSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const CLIENT_DIR = join(process.cwd(), "dist", "client");
const ASSETS_DIR = join(CLIENT_DIR, "assets");
const DEPLOY_DIR = join(process.cwd(), "deploy");

// Ensure deploy dir exists
if (!existsSync(DEPLOY_DIR)) mkdirSync(DEPLOY_DIR, { recursive: true });
const deployAssets = join(DEPLOY_DIR, "assets");
if (!existsSync(deployAssets)) mkdirSync(deployAssets, { recursive: true });

// Find built assets
const files = readdirSync(ASSETS_DIR);
const cssFile = files.find((f) => f.endsWith(".css"));
const jsFiles = files.filter((f) => f.endsWith(".js"));

// Sort JS files: index (main entry) should load last
const indexJs = jsFiles.find((f) => f.startsWith("index-"));
const otherJs = jsFiles.filter((f) => !f.startsWith("index-"));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Flappy Avengers</title>
  <meta name="description" content="Flappy Avengers — pick your hero and fly through the pipes." />
  <meta name="author" content="Lovable" />
  <meta property="og:title" content="Flappy Avengers" />
  <meta property="og:description" content="Pick your Avenger and fly." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.ico" type="image/x-icon" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" />
  ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
</head>
<body>
  <div id="root"></div>
  ${otherJs.map((f) => `<script type="module" src="/assets/${f}"></script>`).join("\n  ")}
  ${indexJs ? `<script type="module" src="/assets/${indexJs}"></script>` : ""}
</body>
</html>
`;

// Write index.html
writeFileSync(join(DEPLOY_DIR, "index.html"), html);

// Copy assets
for (const f of files) {
  copyFileSync(join(ASSETS_DIR, f), join(deployAssets, f));
}

// Copy favicon
const faviconSrc = join(CLIENT_DIR, "favicon.ico");
if (existsSync(faviconSrc)) {
  copyFileSync(faviconSrc, join(DEPLOY_DIR, "favicon.ico"));
}

// Copy .htaccess
const htaccessSrc = join(CLIENT_DIR, ".htaccess");
if (existsSync(htaccessSrc)) {
  copyFileSync(htaccessSrc, join(DEPLOY_DIR, ".htaccess"));
}

console.log("✅ Static deploy build ready in ./deploy/");
console.log(`   index.html, favicon.ico, .htaccess`);
console.log(`   assets: ${files.join(", ")}`);
