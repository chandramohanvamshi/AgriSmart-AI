import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Register all API routes
  await registerRoutes(app);

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    // Dynamic Vite middleware for Development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      configFile: path.resolve(__dirname, "../vite.config.ts"),
    });

    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.resolve(__dirname, "../client/index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Serve static files in production
    const staticPath = path.resolve(__dirname, "../dist/public");
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(staticPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(`🌱 AgriSmart AI: Agricultural Crop Advisory Assistant`);
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`🌍 Mode: ${isProduction ? "Production" : "Development"}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start AgriSmart AI Server:", err);
  process.exit(1);
});
