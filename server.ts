import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import compression from "compression";
import cors from "cors";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(compression());
  app.use(express.json());
  
  // Logging middleware with status code after response
  app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    // Skip logging for noisy vite/hmr requests
    if (req.url.includes('hot-update') || req.url.includes('vite')) {
      return next();
    }

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.url.startsWith('/api')) {
        console.log(`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      } else if (res.statusCode >= 400) {
        console.warn(`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} (FAILED)`);
      }
    });
    next();
  });

  // Serve static files from the 'public' directory
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));
  
  // Specific image serving with explicit paths
  app.use("/images", express.static(path.join(publicPath, "images")));
  
  // Backup image handler to help debug 404s
  app.get("/images/:filename", (req, res) => {
    const filePath = path.join(publicPath, "images", req.params.filename);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.warn(`[Server] Image request failed: ${req.params.filename} at ${filePath}`);
        res.status(404).json({ error: "Image not found" });
      }
    });
  });

  // Health check
  app.get("/api/health", async (req, res) => {
    const imagesPath = path.join(process.cwd(), "public", "images");
    let images: string[] = [];
    try {
      const fs = await import("fs/promises");
      images = await fs.readdir(imagesPath);
    } catch (e) {
      console.error("Error reading images dir:", e);
    }
    
    res.json({ 
      status: "ok", 
      env: process.env.NODE_ENV, 
      cwd: process.cwd(),
      __dirname,
      imagesFound: images
    });
  });

  // Handle other /api routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Path ${req.url} not found or method ${req.method} not supported` });
  });

  // Vite/Static
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    app.use(express.static(distPath, {
      maxAge: "1d",
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        if (path.match(/\.(js|css|woff2|jpg|jpeg|png|gif|svg|webp)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
      }
    }));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
