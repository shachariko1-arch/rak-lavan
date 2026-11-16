/* Yalla English – AI chat proxy (Cloudflare Worker example, not deployed or tested by the app itself).
   The app must never hold the AI key, so it calls this small server, which adds the key and forwards the chat.

   Deploy:  npx wrangler deploy server/ai-chat-worker.js --name yalla-ai
            npx wrangler secret put ANTHROPIC_API_KEY
   Then put the worker URL in js/config.js -> AI_ENDPOINT, and your site's address in ALLOWED_ORIGIN below.
   Before going live add your own sign-in check and per-user rate limit here: this is where paid usage is spent. */
const ALLOWED_ORIGIN = 'https://your-site.example';

export default {
  async fetch(request, env) {
    const cors = { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });
    let body;
    try { body = await request.json(); } catch (e) { return new Response('bad json', { status: 400, headers: cors }); }
    const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-14)
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 600) }));
    if (!messages.length) return new Response('no messages', { status: 400, headers: cors });
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 400, system: String(body.system || '').slice(0, 4000), messages })
    });
    if (!res.ok) return new Response('ai error', { status: 502, headers: cors });
    const data = await res.json();
    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
    return new Response(JSON.stringify({ text }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  }
};
