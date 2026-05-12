import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import compression from "compression";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(compression());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Route for Leads - Improved robustness and explicit CORS/OPTIONS handling
  app.all(["/submit-contact", "/submit-contact/"], async (req, res) => {
    console.log(`[${new Date().toISOString()}] Request: ${req.method} ${req.url}`);
    
    // Explicit CORS for this endpoint
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    if (req.method === 'GET') {
      return res.json({ message: "Contact endpoint is up. Please use POST to send data.", timestamp: new Date().toISOString() });
    }

    if (req.method !== 'POST') {
      console.warn(`[${new Date().toISOString()}] Method not allowed: ${req.method}`);
      return res.status(405).json({ success: false, error: "Method Not Allowed. Please use POST." });
    }

    console.log("Processing POSS lead request with body:", JSON.stringify(req.body));
    const { name, phone, type, details, source } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone is required" });
    }

    const message = `
🚀 *Новая заявка!*
📌 *Источник:* ${source || 'Форма на сайте'}
👤 *Имя:* ${name || 'Не указано'}
📞 *Телефон:* ${phone || 'Не указано'}
🏠 *Объект:* ${type || 'Не указано'}
📝 *Детали:* ${JSON.stringify(details || {})}
    `;

    try {
      // 1. Send to Telegram
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const tgUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(tgUrl, {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        });
        console.log("Telegram notification sent");
      }

      // 2. Send to Google Sheets (via Webhook)
      if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
        await axios.post(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          date: new Date().toLocaleString("ru-RU"),
          name: name || '',
          phone: phone || '',
          source: source || '',
          type: type || '',
          details: JSON.stringify(details || {})
        });
        console.log("Google Sheets notification sent");
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error processing lead:", error.message);
      res.status(500).json({ success: false, error: "Failed to process lead", details: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
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
