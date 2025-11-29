import { execSync } from "child_process";
import { rmSync, readFileSync } from "fs";
import { buildSync } from "esbuild";

console.log("🔨 Building LaunchPad MVP...");

// Clean dist
rmSync("dist", { recursive: true, force: true });
console.log("✓ Cleaned dist directory");

// Build client with Vite
console.log("📦 Building client...");
execSync("npx vite build", { stdio: "inherit" });
console.log("✓ Client built");

// Build server with esbuild
console.log("📦 Building server...");
const allowlist = [
  "@google/generative-ai",
  "@neondatabase/serverless",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const allDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];
const externals = allDeps.filter((dep) => !allowlist.includes(dep));

buildSync({
  entryPoints: ["server/index.ts"],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: "dist/index.cjs",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  minify: true,
  external: externals,
  logLevel: "info",
});

console.log("✓ Server built");
console.log("✅ Build complete!");
