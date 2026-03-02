require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('Set ANTHROPIC_API_KEY in .env');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest';
  const prompt = process.env.CLAUDE_PROMPT || 'Say hello from Claude in one short sentence.';

  const response = await client.messages.create({
    model,
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  console.log(text || 'No text response');
}

main().catch((error) => {
  console.error('Claude request failed:', error.message);
  process.exit(1);
});
