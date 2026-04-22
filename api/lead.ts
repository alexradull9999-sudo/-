import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, type, details, source } = request.body;

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

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing lead:", error);
    return response.status(500).json({ success: false, error: "Failed to process lead" });
  }
}
