import express, { type Express } from "express";
import fs from "fs";
import path from "path";

let indexHtmlContent = "";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  const indexPath = path.resolve(distPath, "index.html");

  console.log("🔧 serveStatic called with distPath:", distPath);

  try {
    // Check if files exist
    if (!fs.existsSync(distPath)) {
      console.error("❌ dist/public not found at:", distPath);
      console.log("📁 Current directory:", process.cwd());
      console.log("📁 Files in current directory:", fs.readdirSync(process.cwd()));
      // Don't throw - continue anyway
    }

    if (!fs.existsSync(indexPath)) {
      console.error("❌ index.html not found at:", indexPath);
      // Don't throw - continue anyway
    } else {
      // Load HTML once at startup
      indexHtmlContent = fs.readFileSync(indexPath, "utf-8");
      console.log("✅ Loaded index.html:", indexHtmlContent.length, "bytes");
    }

    // Serve static files
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { index: false }));
      console.log("✅ Static middleware configured for:", distPath);
    }
  } catch (err) {
    console.error("⚠️ Error in serveStatic:", err);
  }

  // Always add the SPA fallback route - this is critical
  app.use("*", (req, res) => {
    // If we have the HTML content, send it
    if (indexHtmlContent) {
      console.log("📄 Sending preloaded HTML for:", req.path);
      res.type("text/html").send(indexHtmlContent);
    } else {
      // Fallback: try to read and send
      try {
        const indexPath = path.resolve(process.cwd(), "dist", "public", "index.html");
        const html = fs.readFileSync(indexPath, "utf-8");
        console.log("📄 Sending HTML from disk for:", req.path);
        res.type("text/html").send(html);
      } catch (err) {
        console.error("❌ Cannot serve HTML for", req.path, ":", err);
        res.status(500).type("text/html").send("<h1>Error: Could not load application</h1>");
      }
    }
  });
}
