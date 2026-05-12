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

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Route for Leads - More integrations and more robust path
  app.all(["/api/lead", "/api/lead/"], async (req, res) => {
    console.log(`[${new Date().toISOString()}] Request to ${req.url} with method ${req.method}`);
    
    // Explicit CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    if (req.method === 'GET') {
      return res.json({ status: "Lead endpoint active", method: "POST required for submissions" });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

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
📝 *Детали:* ${typeof details === 'object' ? JSON.stringify(details) : (details || 'Нет')}
    `;

    try {
      const results: any = {
        timestamp: new Date().toISOString()
      };

      // 1. Telegram
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
          const tgUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
          await axios.post(tgUrl, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
          });
          results.telegram = "sent";
        } catch (e: any) {
          results.telegram = `error: ${e.message}`;
        }
      }

      // 2. Discord
      if (process.env.DISCORD_WEBHOOK_URL) {
        try {
          await axios.post(process.env.DISCORD_WEBHOOK_URL, {
            content: `**Новая заявка!**\n${message.replace(/\*/g, '')}`
          });
          results.discord = "sent";
        } catch (e: any) {
          results.discord = `error: ${e.message}`;
        }
      }

      // 3. Email
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.EMAIL_TO) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: process.env.EMAIL_TO,
            subject: `Новая заявка: ${name || phone}`,
            text: message.replace(/\*/g, ''),
            html: `<h3>Новая заявка!</h3><pre>${message.replace(/\*/g, '')}</pre>`,
          });
          results.email = "sent";
        } catch (e: any) {
          results.email = `error: ${e.message}`;
        }
      }

      // 4. Bitrix24 (Webhook)
      if (process.env.BITRIX24_WEBHOOK_URL) {
        try {
          // Bitrix24 simple webhook for lead.add
          await axios.post(`${process.env.BITRIX24_WEBHOOK_URL}/crm.lead.add.json`, {
            fields: {
              TITLE: `Заявка с сайта (${source})`,
              NAME: name || 'Без имени',
              PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }],
              COMMENTS: `Объект: ${type || '-'}\nДетали: ${JSON.stringify(details || {})}`,
              SOURCE_ID: "WEB"
            }
          });
          results.bitrix24 = "sent";
        } catch (e: any) {
          results.bitrix24 = `error: ${e.message}`;
        }
      }

      // 5. AmoCRM (Webhook / API simple) - Usually needs more complex auth but some webhooks are simple
      if (process.env.AMOCRM_WEBHOOK_URL) {
        try {
          await axios.post(process.env.AMOCRM_WEBHOOK_URL, {
            leads: {
              add: [{
                name: `Заявка с сайта`,
                custom_fields: [
                  { id: 12345, values: [{ value: phone }] } // Example phone field ID
                ]
              }]
            }
          });
          results.amocrm = "sent";
        } catch (e: any) {
          results.amocrm = `error: ${e.message}`;
        }
      }

      // 6. Generic Webhook (Zapier/Make)
      if (process.env.GENERIC_WEBHOOK_URL) {
        try {
          await axios.post(process.env.GENERIC_WEBHOOK_URL, {
            name, phone, type, details, source, timestamp: results.timestamp
          });
          results.webhook = "sent";
        } catch (e: any) {
          results.webhook = `error: ${e.message}`;
        }
      }

      // 7. Google Sheets
      if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
        try {
          await axios.post(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
            date: new Date().toLocaleString("ru-RU"),
            name: name || '',
            phone: phone || '',
            source: source || '',
            type: type || '',
            details: JSON.stringify(details || {})
          });
          results.google_sheets = "sent";
        } catch (e: any) {
          results.google_sheets = `error: ${e.message}`;
        }
      }

      console.log("Lead processing results:", JSON.stringify(results));
      res.status(200).json({ success: true, results });
    } catch (error: any) {
      console.error("Critical error processing lead:", error.message);
      res.status(500).json({ success: false, error: "Critical failure", details: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV, integrations: {
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      discord: !!process.env.DISCORD_WEBHOOK_URL,
      email: !!process.env.SMTP_HOST,
      bitrix24: !!process.env.BITRIX24_WEBHOOK_URL,
      amocrm: !!process.env.AMOCRM_WEBHOOK_URL,
      webhook: !!process.env.GENERIC_WEBHOOK_URL,
      sheets: !!process.env.GOOGLE_SHEETS_WEBHOOK_URL
    } });
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
