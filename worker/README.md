# Бэкенд Zher-Kömek (Cloudflare Worker)

Бесплатный серверный бэкенд для безопасного приёма заявок и отправки уведомлений в Telegram.

## Шаги деплоя (бесплатно)

1. Установите `wrangler` (CLI Cloudflare):
   ```bash
   npm install -g wrangler
   ```

2. Войдите в аккаунт Cloudflare:
   ```bash
   npx wrangler login
   ```

3. Задайте секретные переменные окружения (введя токен бота и chat ID):
   ```bash
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID
   ```

4. Опубликуйте Worker:
   ```bash
   npx wrangler deploy
   ```

5. После публикации вы получите URL (например: `https://zherkomek-api.your-subdomain.workers.dev`).
   Вставьте этот URL в `script.js` в переменную:
   ```javascript
   const CONFIG = {
       WHATSAPP_URL: 'https://wa.me/77778006286',
       FORM_ENDPOINT: 'https://zherkomek-api.your-subdomain.workers.dev/api/leads'
   };
   ```
