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

  // Serve static assets
  app.use(
    express.static(distPath, {
      maxAge: "1d",
      setHeaders: (res, filepath) => {
        if (filepath.endsWith(".html")) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    })
  );

  // SPA routing - serve index.html for all routes
  app.use("*", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.sendFile(indexPath);
  });
}
