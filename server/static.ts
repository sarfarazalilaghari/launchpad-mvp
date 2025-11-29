import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(__dirname, "..", "dist", "public"),
    "/vercel/path0/dist/public",
  ];

  let distPath = null;
  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      distPath = tryPath;
      console.log("✅ Found build directory:", distPath);
      break;
    }
  }

  if (!distPath) {
    throw new Error(`Build directory not found in: ${possiblePaths.join(", ")}`);
  }

  const indexPath = path.resolve(distPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`index.html not found at ${indexPath}`);
  }

  // Pre-read index.html to ensure it's available
  let indexHtmlContent = "";
  try {
    indexHtmlContent = fs.readFileSync(indexPath, "utf-8");
    console.log("✅ Preloaded index.html, size:", indexHtmlContent.length, "bytes");
  } catch (err) {
    console.error("❌ Failed to preload index.html:", err);
    throw err;
  }

  // Serve static assets with explicit content type handling
  app.use(
    express.static(distPath, {
      maxAge: "1d",
      index: false, // Disable automatic index.html serving
      setHeaders: (res, filepath) => {
        if (filepath.endsWith(".html")) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("X-Content-Type-Options", "nosniff");
        } else if (filepath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        } else if (filepath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
        }
      },
    })
  );

  // SPA routing - serve index.html for all unmatched routes
  app.use("*", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(indexHtmlContent);
  });
}
