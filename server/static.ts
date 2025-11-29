import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  // Get the correct directory path using __dirname equivalent for ES modules
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // Try multiple possible locations for the build output
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
    console.error("❌ Could not find build directory in any of:", possiblePaths);
    console.error("Current working directory:", process.cwd());
    console.error("__dirname:", __dirname);
    throw new Error("Build directory not found. Make sure to run npm run build");
  }

  const indexPath = path.resolve(distPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.error("❌ index.html not found at:", indexPath);
    throw new Error(`index.html not found at ${indexPath}`);
  }

  console.log("📄 Serving from:", distPath);
  console.log("📄 Index.html found at:", indexPath);

  // Serve static assets with proper headers
  app.use(express.static(distPath, {
    maxAge: "1d",
    setHeaders: (res, filepath) => {
      // Set proper Content-Type for HTML files
      if (filepath.endsWith(".html")) {
        res.set("Content-Type", "text/html; charset=utf-8");
        res.set("Cache-Control", "public, max-age=0");
      } else if (filepath.endsWith(".js")) {
        res.set("Content-Type", "application/javascript; charset=utf-8");
      } else if (filepath.endsWith(".css")) {
        res.set("Content-Type", "text/css; charset=utf-8");
      }
    },
  }));

  // SPA routing: serve index.html for all unmatched routes
  app.use("*", (_req, res) => {
    console.log("🔄 Serving SPA fallback to index.html");
    res.set("Content-Type", "text/html; charset=utf-8");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("❌ Error sending index.html:", err.message);
        res.status(404).send("index.html not found");
      }
    });
  });
}
