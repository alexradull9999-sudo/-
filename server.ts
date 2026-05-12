import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import compression from "compression";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(compression());
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // API Route for Leads
  app.post("/api/lead", async (req, res) => {
    const { name, phone, type, details, source } = req.body;

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
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing lead:", error);
      res.status(500).json({ success: false, error: "Failed to process lead" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Настройка кеширования: картинки и шрифты кешируются на 1 год
    app.use(express.static(distPath, {
      maxAge: "1d", // Кеш на 1 день для всей статики (можно увеличить до 365d)
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        if (path.match(/\.(js|css|woff2|jpg|jpeg|png|gif|svg|webp)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год для медиа
        }
      }
    }));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
