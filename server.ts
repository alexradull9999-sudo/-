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
      const SHEETS_URL = (process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbzNEEa_VmqsGaV2JGuX_bnCvUccbQbAEBtSkGhrsIUU5l_nYKCDTbF_v_0nidGzRgkY/exec").trim();

      if (SHEETS_URL) {
        try {
          const payload = JSON.stringify({
            date: new Date().toLocaleString("ru-RU"),
            name: name || '',
            phone: phone || '',
            source: source || 'Website',
            type: type || '',
            details: typeof details === 'object' ? JSON.stringify(details) : (details || '')
          });

          const headers = {
            'Content-Type': 'text/plain;charset=utf-8',
          };

          console.log(`[GoogleSheets] Sending to: ${SHEETS_URL}`);

          let finalResponse: any = null;

          try {
            // Первый запрос — ловим 302 как ошибку
            finalResponse = await axios.post(SHEETS_URL, payload, {
              headers,
              maxRedirects: 0,
              validateStatus: (status) => status >= 200 && status < 300, // 302 → бросит ошибку
            });
          } catch (redirectError: any) {
            const status = redirectError.response?.status;
            const location = redirectError.response?.headers?.location;

            if (status === 302 && location) {
              console.log(`[GoogleSheets] 302 redirect detected. Fetching result from: ${location.substring(0, 80)}...`);

              // Google Apps Script requires a GET request to the redirect URL to see the output
              finalResponse = await axios.get(location, {
                headers: { 'Accept': 'application/json' },
                maxRedirects: 5,
                validateStatus: (s) => s < 500,
              });
            } else {
              // Не редирект — пробрасываем ошибку дальше
              throw redirectError;
            }
          }

          if (finalResponse && finalResponse.status >= 200 && finalResponse.status < 400) {
            results.google_sheets = "sent";
            console.log(`[GoogleSheets] Success! Status: ${finalResponse.status}`, finalResponse.data);
          } else {
            const st = finalResponse?.status ?? 'unknown';
            console.error(`[GoogleSheets] Failed. Status: ${st}`, finalResponse?.data);
            results.google_sheets = `error: ${st}`;
          }

        } catch (e: any) {
          const status = e.response?.status;
          console.error(`[GoogleSheets] Request Error: ${status ?? 'No Status'} ${e.message}`);
          if (e.response?.data) {
            console.error(`[GoogleSheets] Error Data:`, e.response.data);
          }
          results.google_sheets = `error: ${status ?? e.message}`;
        }
      } else {
        results.google_sheets = "skipped: URL not set";
      }

      console.log("Lead processing results:", JSON.stringify(results));
      res.status(200).json({ success: true, results });
    } catch (error: any) {
      console.error("Critical error processing lead:", error.message);
      res.status(500).json({ success: false, error: "Critical failure", details: error.message });
    }
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
      imagesFound: images,
      integrations: {
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
