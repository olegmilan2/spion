require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest';

const ROOT = process.cwd();
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const anthropic = API_KEY ? new Anthropic({ apiKey: API_KEY }) : null;

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('JSON not found in model output');
  }
  return JSON.parse(text.slice(start, end + 1));
}

function normalizeCategory(input) {
  const allowed = ['all', 'general', 'cinema', 'sport', 'travel', 'work', 'history', 'tech', 'crime', 'extreme', 'vip', 'odessa'];
  return allowed.includes(input) ? input : 'all';
}

function normalizeDifficulty(input) {
  const allowed = ['all', 'easy', 'medium', 'hard'];
  return allowed.includes(input) ? input : 'all';
}

async function generateRoundWithAI({ category, difficulty, civiliansCount }) {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const prompt = [
    'Ты генератор данных для игры "Шпион".',
    'Сгенерируй 1 локацию, список ролей для мирных и 10 коротких вопросов.',
    `Категория: ${category}.`,
    `Сложность: ${difficulty}.`,
    `Количество ролей мирных: ${civiliansCount}.`,
    'Требования:',
    '- Ответ строго в JSON, без markdown.',
    '- Поля: location (string), category (string), difficulty (string), roles (string[]), questions (string[]).',
    '- roles длиной ровно civiliansCount.',
    '- roles должны подходить к location.',
    '- questions длиной ровно 10, короткие и естественные.',
    '- Русский язык.'
  ].join('\n');

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const json = extractJson(text);
  const normalized = {
    location: String(json.location || '').trim(),
    category: normalizeCategory(String(json.category || category || 'all')),
    difficulty: normalizeDifficulty(String(json.difficulty || difficulty || 'all')),
    roles: Array.isArray(json.roles) ? json.roles.map((x) => String(x || '').trim()).filter(Boolean) : [],
    questions: Array.isArray(json.questions) ? json.questions.map((x) => String(x || '').trim()).filter(Boolean) : []
  };

  if (!normalized.location) {
    throw new Error('AI returned empty location');
  }
  if (normalized.roles.length < civiliansCount) {
    throw new Error('AI returned too few roles');
  }
  if (normalized.questions.length < 5) {
    throw new Error('AI returned too few questions');
  }

  normalized.roles = normalized.roles.slice(0, civiliansCount);
  normalized.questions = normalized.questions.slice(0, 10);
  return normalized;
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0] || '/');
  const safePath = urlPath === '/' ? '/index.html' : urlPath;
  const abs = path.join(ROOT, safePath);
  if (!abs.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(abs, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(abs).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/generate-round') {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw || '{}');
      const category = normalizeCategory(String(body.category || 'all'));
      const difficulty = normalizeDifficulty(String(body.difficulty || 'all'));
      const civiliansCount = Math.max(1, Math.min(20, Number(body.civiliansCount || 1)));
      const data = await generateRoundWithAI({ category, difficulty, civiliansCount });
      sendJson(res, 200, { ok: true, data });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error.message });
    }
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  const aiState = anthropic ? `AI enabled (${MODEL})` : 'AI disabled (missing ANTHROPIC_API_KEY)';
  console.log(`Server running on http://localhost:${PORT} - ${aiState}`);
});
