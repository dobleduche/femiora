export type ClientMsg = { role: 'user' | 'model'; text: string };

export type TavilySource = { id: string; title: string; url: string; snippet: string };

export function looksLikeLabIntent(text: string) {
  const t = (text || '').toLowerCase();
  const keywords = [
    'fsh', 'lh', 'estradiol', 'e2', 'progesterone',
    'tsh', 't3', 't4', 'thyroid',
    'a1c', 'hemoglobin a1c', 'ferritin', 'cbc', 'cmp',
    'lipid panel', 'vitamin d', 'b12', 'insulin', 'cortisol', 'prolactin',
    'reference range', 'lab result', 'bloodwork', 'blood work'
  ];
  const phrases = ['what does this mean', 'is this normal', 'interpret my results'];
  return keywords.some(k => t.includes(k)) || phrases.some(p => t.includes(p));
}

export function mapHistory(history: ClientMsg[]) {
  const safe = Array.isArray(history) ? history.slice(-20) : [];
  return safe
    .filter(m => typeof m?.text === 'string' && m.text.trim().length > 0)
    .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
}

export function oraSystemPrompt(recentLogs: unknown[]) {
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
    JSON.stringify(safeLogs)
  ].join('\n');
}

export function labAddendum(sourcesBlockOrNull: string | null) {
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
    `- If sources are NOT provided, do NOT claim web research; keep it high-level and explicitly say you don’t have sourced references loaded.`
  ].join('\n');

  if (!sourcesBlockOrNull) return base + `\n\nNO_SOURCES_AVAILABLE`;
  return base + `\n\nSOURCES:\n${sourcesBlockOrNull}`;
}

export function buildSourcesBlock(sources: TavilySource[]) {
  if (!sources?.length) return null;
  return sources
    .slice(0, 5)
    .map(s => `${s.id} | ${s.title} | ${s.url}\nSnippet: ${s.snippet}`)
    .join('\n\n');
}

/**
 * Converts OpenRouter SSE stream -> plain text chunks.
 * Works in both Express and Serverless as long as caller provides:
 *  - readableStream: Response.body (web stream)
 *  - onToken: (token) => void
 */
export async function pipeOpenRouterStreamToText(
  readableStream: ReadableStream<Uint8Array>,
  onToken: (token: string) => void
) {
  const reader = readableStream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const data = trimmed.slice(5).trim();
      if (!data) continue;
      if (data === '[DONE]') return;

      try {
        const json = JSON.parse(data);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length) onToken(delta);
      } catch {
        // ignore partial frames
      }
    }
  }
}
