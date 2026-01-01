import express, { Request, Response } from 'express';

const router = express.Router();

type ClientMsg = { role: 'user' | 'model'; text: string };

const ORA_SYSTEM = (recentLogs: unknown[]) => {
  const safeLogs = Array.isArray(recentLogs) ? recentLogs.slice(-14) : [];
  return [
    `You are Ora, the Femiora companion.`,
    `You help users notice patterns across cycle timing, mood, sleep, stress, environment, and daily habits using only Femiora’s tracking features.`,
    `You are compassionate, understanding, intelligent, knowledgeable, and courteous.`,
    `Your tone is warm, grounded, feminine, and honest—soft but never fake.`,
    ``,
    `CRITICAL BOUNDARIES:`,
    `- You are not a medical provider. Do not diagnose, treat, prescribe, recommend medications or supplements, provide dosing, or claim clinical authority.`,
    `- Do not claim personal lived experience of menopause/perimenopause. Use “many people notice/describe” and focus on the user’s own data.`,
    `- Do not discuss weight loss or obesity. Food/hydration/movement can be discussed only as neutral variables the user can track, without moralizing or judgment.`,
    `- Do not promise outcomes.`,
    ``,
    `DEFAULT RESPONSE CONTRACT (always do these 3 steps):`,
    `1) MIRROR: validate emotion without escalating fear.`,
    `2) MAP: reflect possible patterns using the user’s logs/timing/context in neutral language.`,
    `3) MOVE: suggest one small next step inside Femiora (log, tag, journal, review insight, export summary).`,
    ``,
    `QUESTION LIMIT: ask at most 2 questions per reply (prefer 0–1).`,
    ``,
    `EMERGENCY ESCALATION:`,
    `If the user describes red flags (chest pain, fainting, heavy bleeding soaking pads hourly, suicidal thoughts/self-harm, severe confusion, one-sided weakness, severe allergic reaction), respond briefly with support and advise urgent professional help or emergency services. Do not provide self-treatment instructions.`,
    ``,
    `Always anchor responses in user-reported experience. Never invent causes. Never predict outcomes.`,
    ``,
    `Recent logs (last 14 days) for pattern context:`,
    JSON.stringify(safeLogs),
  ].join('\n');
};

const LAB_ADDENDUM = (sourcesBlock: string | null) => {
  const disclaimer =
    `Quick note: I’m not a medical provider and I can’t diagnose or clinically interpret labs. ` +
    `I can explain what this test generally means using reputable public references, and help you track patterns in Femiora ` +
    `so you can discuss it clearly with a licensed clinician.`;

  const base = [
    `LAB LITERACY MODE (USER-INITIATED ONLY)`,
    `- Never ask the user to obtain labs or upload lab results.`,
    `- Only activate this mode if the user shares lab results, uploads a lab screenshot, or asks what a test/result means.`,
    `- Lead with this disclaimer in the first 2 sentences: ${disclaimer}`,
    `- Explain what the test generally measures and common reasons it’s ordered.`,
    `- Explain variability/limits; reproductive hormones can fluctuate and a single test often cannot confirm perimenopause/menopause.`,
    `- Never confirm a diagnosis from labs.`,
    `- Ask at most ONE clarifying question if needed: test name, value, units, reference range.`,
    `- If sources are provided, cite them inline like [S1], [S2], and end with a “Sources:” list.`,
    `- If sources are NOT provided, do NOT claim web research; keep it high-level and explicitly say you don’t have sourced references loaded.`,
  ].join('\n');

  if (!sourcesBlock) return base + `\n\nNO_SOURCES_AVAILABLE`;
  return base + `\n\nSOURCES:\n` + sourcesBlock;
};

const looksLikeLabIntent = (text: string) => {
  const t = text.toLowerCase();
  const keywords = [
    'fsh', 'lh', 'estradiol', 'e2', 'progesterone', 'tsh', 't3', 't4', 'thyroid',
    'a1c', 'hemoglobin a1c', 'ferritin', 'cbc', 'cmp', 'lipid panel', 'vitamin d', 'b12',
    'insulin', 'cortisol', 'prolactin', 'reference range', 'lab result', 'bloodwork', 'blood work'
  ];
  const phrases = ['what does this mean', 'is this normal', 'interpret my results'];
  return keywords.some(k => t.includes(k)) || phrases.some(p => t.includes(p));
};

const mapClientHistoryToOpenAI = (history: ClientMsg[]) => {
  const safe = Array.isArray(history) ? history.slice(-20) : [];
  return safe
    .filter(m => typeof m?.text === 'string' && m.text.trim().length > 0)
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));
};

type TavilyResult = { title?: string; url?: string; content?: string };
type TavilyResponse = { results?: TavilyResult[] };

const tavilySearch = async (query: string) => {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return null;

  const includeDomains = [
    'acog.org',
    'mayoclinic.org',
    'clevelandclinic.org',
    'medlineplus.gov',
    'nih.gov',
    'nhs.uk',
    'nice.org.uk',
  ];

  const resp = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: false,
      include_raw_content: false,
      include_domains: includeDomains,
      topic: 'general',
    }),
  });

  if (!resp.ok) return null;
  const data = (await resp.json()) as TavilyResponse;

  const results = (data.results || []).slice(0, 5).map((r, i) => {
    const title = (r.title || '').trim();
    const url = (r.url || '').trim();
    const snippet = (r.content || '').trim().slice(0, 500);
    if (!title || !url) return null;
    return { id: `S${i + 1}`, title, url, snippet };
  }).filter(Boolean) as Array<{ id: string; title: string; url: string; snippet: string }>;

  if (results.length === 0) return null;

  // SOURCES block fed to the model
  const sourcesBlock = results
    .map(s => `${s.id} | ${s.title} | ${s.url}\nSnippet: ${s.snippet}`)
    .join('\n\n');

  return { results, sourcesBlock };
};

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY.' });
    }

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const history = Array.isArray(req.body?.history) ? (req.body.history as ClientMsg[]) : [];
    const recentLogs = Array.isArray(req.body?.recentLogs) ? req.body.recentLogs : [];

    if (!message) return res.status(400).json({ error: 'Message is required.' });
    if (message.length > 6000) return res.status(400).json({ error: 'Message is too long.' });

    const isLab = looksLikeLabIntent(message);

    // Optional: only fetch sources for lab mode
    let sourcesBlock: string | null = null;
    if (isLab) {
      const tavily = await tavilySearch(`Explain this lab test in general terms: ${message}`);
      sourcesBlock = tavily?.sourcesBlock ?? null;
    }

    const model = process.env.OPENROUTER_MODEL?.trim() || 'anthropic/claude-3.5-sonnet';
    const appUrl = process.env.APP_URL?.trim() || 'http://localhost';
    const appTitle = process.env.APP_TITLE?.trim() || 'Femiora';

    const messages = [
      { role: 'system', content: ORA_SYSTEM(recentLogs) },
      ...(isLab ? [{ role: 'system', content: LAB_ADDENDUM(sourcesBlock) }] : []),
      ...mapClientHistoryToOpenAI(history),
      { role: 'user', content: message },
    ];

    // Prepare streaming response to client
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const ac = new AbortController();
    req.on('close', () => ac.abort());

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: ac.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        // Optional attribution headers supported by OpenRouter :contentReference[oaicite:3]{index=3}
        'HTTP-Referer': appUrl,
        'X-Title': appTitle,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      let detail = '';
      try {
        detail = await upstream.text();
      } catch {
        // ignore
      }
      res.write(`Ora hit a network issue. Please try again.\n`);
      res.end();
      return;
    }

    // Parse upstream SSE stream (data: {...}) and forward plain text chunks
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames separated by \n\n, but can be chunk-split; handle line-by-line safely
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();
        if (!data) continue;
        if (data === '[DONE]') {
          res.end();
          return;
        }

        try {
          const json = JSON.parse(data);
          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            res.write(delta);
          }
        } catch {
          // ignore malformed partial lines
        }
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    // If headers already started, just end the stream
    if (res.headersSent) {
      try { res.end(); } catch {}
      return;
    }
    res.status(500).json({ error: 'Ora could not respond. Please try again.' });
  }
});

export default router;
