/**
 * Zher-Kömek Serverless Form Backend (Cloudflare Worker)
 * Endpoint: POST /api/leads
 */

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '*';
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin.includes('zherkomek.com') || origin.includes('github.io') || origin.includes('localhost') ? origin : 'https://zherkomek.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false, message: 'Method Not Allowed' }), {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const body = await request.json().catch(() => null);
      if (!body) {
        return new Response(JSON.stringify({ ok: false, message: 'Неверный формат JSON' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // 1. Honeypot check (bot prevention)
      if (body.website && body.website.length > 0) {
        return new Response(JSON.stringify({ ok: true, message: 'Заявка принята' }), {
          status: 200,
          headers: corsHeaders
        });
      }

      // 2. Validate required fields
      const name = sanitize(body.name || '');
      const rawPhone = String(body.phone || '');
      const region = sanitize(body.region || '');
      const district = sanitize(body.district || '');
      const purpose = sanitize(body.purpose || '');
      const source = sanitize(body.source || 'website');

      if (!name || name.length > 100) {
        return new Response(JSON.stringify({ ok: false, message: 'Укажите ваше имя (до 100 символов)' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Normalize phone: remove non-digits
      const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
      if (cleanPhoneDigits.length < 10 || cleanPhoneDigits.length > 15) {
        return new Response(JSON.stringify({ ok: false, message: 'Проверьте номер телефона' }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Format clean phone for notifications
      const formattedPhone = cleanPhoneDigits.length === 11 && cleanPhoneDigits.startsWith('7')
        ? `+7 (${cleanPhoneDigits.slice(1,4)}) ${cleanPhoneDigits.slice(4,7)}-${cleanPhoneDigits.slice(7,9)}-${cleanPhoneDigits.slice(9,11)}`
        : `+${cleanPhoneDigits}`;

      // 3. Send Notification to Telegram (if secrets configured)
      const botToken = env.TELEGRAM_BOT_TOKEN;
      const chatId = env.TELEGRAM_CHAT_ID;

      if (botToken && chatId) {
        const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' });
        const tgMessage = `🚀 <b>Новая заявка на Zher-Kömek</b>\n\n` +
          `👤 <b>Имя:</b> ${escapeHtml(name)}\n` +
          `📞 <b>Телефон:</b> ${escapeHtml(formattedPhone)}\n` +
          `📍 <b>Регион:</b> ${escapeHtml(region)}\n` +
          `🏘️ <b>Район/НП:</b> ${escapeHtml(district || 'Не указан')}\n` +
          `📌 <b>Назначение:</b> ${escapeHtml(purpose || 'Не указано')}\n` +
          `🎯 <b>Источник:</b> ${escapeHtml(source)}\n` +
          `🕒 <b>Время:</b> ${timestamp}`;

        const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await fetch(tgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: tgMessage,
            parse_mode: 'HTML'
          })
        });
      }

      return new Response(JSON.stringify({ ok: true, message: 'Заявка принята! Специалист свяжется с вами в течение рабочего дня.' }), {
        status: 200,
        headers: corsHeaders
      });

    } catch (err) {
      console.error('Worker execution error:', err);
      return new Response(JSON.stringify({ ok: false, message: 'Внутренняя ошибка сервера' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 300);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
