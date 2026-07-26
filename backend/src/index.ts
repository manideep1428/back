import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

// Load .env variables
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equalsIdx = trimmed.indexOf('=');
      if (equalsIdx > 0) {
        const key = trimmed.slice(0, equalsIdx).trim();
        let value = trimmed.slice(equalsIdx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile();

/**
 * Maps client requested model ID to valid Kiro backend model
 */
export function mapToKiroModelId(requestedModel?: string): string {
  const defaultModel = process.env.MODEL_ID || 'gpt-5.6-sol';
  if (!requestedModel) return defaultModel;
  if (requestedModel === 'gpt-5.6-sol' || requestedModel === 'claude-3-5-sonnet') {
    return requestedModel;
  }
  return defaultModel;
}

/**
 * Triggers kiro-cli OAuth token refresh
 */
export function forceRefreshKiroToken() {
  try {
    execSync('kiro-cli whoami', { stdio: 'ignore' });
  } catch {
    // Ignore
  }
}

/**
 * Retrieves active Kiro token & profile ARN automatically
 */
export function getLiveKiroCredentials(): { authToken: string; profileArn: string } {
  let authToken = process.env.AUTH_TOKEN || process.env.KIRO_AUTH_TOKEN || process.env.BEARER_TOKEN || '';
  let profileArn = process.env.PROFILE_ARN || process.env.KIRO_PROFILE_ARN || '';

  if (authToken && authToken.trim() !== '') {
    return { authToken, profileArn };
  }

  const readFromSqlite = () => {
    try {
      const userHome = process.env.USERPROFILE || process.env.HOME || '';
      const candidatePaths = [
        path.join(userHome, 'AppData', 'Local', 'Kiro-Cli', 'data.sqlite3'),
        path.join(userHome, '.local', 'share', 'Kiro-Cli', 'data.sqlite3'),
        path.join(userHome, '.config', 'Kiro-Cli', 'data.sqlite3'),
        path.join(userHome, '.kiro', 'data.sqlite3'),
        '/home/ubuntu/.local/share/Kiro-Cli/data.sqlite3',
        '/home/ubuntu/.config/Kiro-Cli/data.sqlite3',
        '/root/.local/share/Kiro-Cli/data.sqlite3',
        '/root/.config/Kiro-Cli/data.sqlite3',
        '/home/ec2-user/.local/share/Kiro-Cli/data.sqlite3',
      ];

      const dbPath = candidatePaths.find((p) => fs.existsSync(p));
      if (dbPath) {
        const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
        const pyCmd = `${pythonBin} -c "import sqlite3, json; conn = sqlite3.connect(r'${dbPath}'); rows = conn.execute(\\\"SELECT value FROM auth_kv WHERE key LIKE '%token%'\\\").fetchall(); tokens = [r[0] for r in rows if r[0]]; print(tokens[0] if tokens else '')"`;
        const output = execSync(pyCmd, { encoding: 'utf-8' }).trim();
        if (output) {
          const parsed = JSON.parse(output);
          const token = parsed.access_token || parsed.accessToken || parsed.token || parsed.id_token;
          if (token) {
            return {
              authToken: token,
              profileArn: parsed.profile_arn || parsed.profileArn || profileArn,
            };
          }
        }
      }
    } catch (err: any) {
      console.error('Error reading SQLite Kiro token:', err?.message);
    }
    return null;
  };

  let creds = readFromSqlite();
  if (!creds) {
    forceRefreshKiroToken();
    creds = readFromSqlite();
  }

  if (creds) {
    return creds;
  }

  try {
    const userHome = process.env.USERPROFILE || process.env.HOME || '';
    const tokenPath = path.join(userHome, '.aws', 'sso', 'cache', 'kiro-auth-token.json');
    if (fs.existsSync(tokenPath)) {
      const data = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      if (data.accessToken) {
        authToken = data.accessToken;
        if (data.profileArn) profileArn = data.profileArn;
      }
    }
  } catch {
    // Ignore
  }

  return { authToken, profileArn };
}

export interface KiroStreamOptions {
  prompt: string;
  authToken?: string;
  backendUrl?: string;
  profileArn?: string;
  modelId?: string;
  agentMode?: string;
  conversationId?: string;
  tools?: any[];
  onChunk?: (chunk: string) => void;
  onEvent?: (event: any) => void;
}

export interface KiroStreamResult {
  fullText: string;
  stopReason?: string;
  events: any[];
}

export async function* streamKiroResponseGenerator(
  options: KiroStreamOptions
): AsyncGenerator<string | any, KiroStreamResult, void> {
  let creds = getLiveKiroCredentials();
  let authToken = options.authToken || creds.authToken;
  let profileArn = options.profileArn || creds.profileArn;

  let backendUrl =
    options.backendUrl ||
    process.env.BACKEND_URL ||
    'https://runtime.us-east-1.kiro.dev';

  if (!authToken) {
    throw new Error('Missing Auth Token. Log into Kiro CLI or set AUTH_TOKEN in .env.');
  }

  backendUrl = backendUrl.replace(/\/$/, '');
  const endpoint = backendUrl.endsWith('/generateAssistantResponse')
    ? backendUrl
    : `${backendUrl}/generateAssistantResponse`;

  const modelId = mapToKiroModelId(options.modelId);
  const agentMode = options.agentMode || process.env.AGENT_MODE || 'default';
  const agentTaskType = 'vibe';

  const conversationId =
    options.conversationId ||
    `conv-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const formattedTools = (options.tools || []).map((t: any) => {
    if (t.toolSpecification) return t;
    return {
      toolSpecification: {
        name: t.name,
        description: t.description || '',
        inputSchema: {
          json: t.input_schema || t.inputSchema || { type: 'object', properties: {} }
        }
      }
    };
  });

  const payload: Record<string, any> = {
    conversationState: {
      conversationId: conversationId,
      agentContinuationId: crypto.randomUUID(),
      agentTaskType: agentTaskType,
      chatTriggerType: 'MANUAL',
      currentMessage: {
        userInputMessage: {
          content: options.prompt,
          modelId: modelId,
          origin: 'AI_EDITOR',
          userInputMessageContext: {
            tools: formattedTools
          }
        }
      },
      history: []
    }
  };

  if (profileArn && profileArn.trim() !== '') {
    payload.profileArn = profileArn.trim();
  }

  if (agentMode && agentMode.trim() !== '') {
    payload.agentMode = agentMode.trim();
  }

  let response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken.replace(/^Bearer\s+/i, '')}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify(payload)
  });

  if (response.status === 403) {
    forceRefreshKiroToken();
    creds = getLiveKiroCredentials();
    authToken = creds.authToken || authToken;
    if (creds.profileArn) payload.profileArn = creds.profileArn;

    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken.replace(/^Bearer\s+/i, '')}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(payload)
    });
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Kiro Backend API Error (Status ${response.status} ${response.statusText}): ${errorText}`
    );
  }

  if (!response.body) {
    throw new Error('Response body is null, expected readable SSE stream.');
  }

  const contentType = response.headers.get('content-type') || '';
  const isBinaryEventStream = contentType.includes('vnd.amazon.eventstream');

  const events: any[] = [];
  let fullText = '';
  let stopReason: string | undefined;

  const processJsonObject = (parsed: any) => {
    events.push(parsed);
    if (options.onEvent) {
      options.onEvent(parsed);
    }

    if (parsed.toolUseId || parsed.name || parsed.toolUseEvent || parsed.toolCall) {
      const toolUseId = parsed.toolUseId || parsed.toolUseEvent?.toolUseId || parsed.toolCall?.id;
      const name = parsed.name || parsed.toolUseEvent?.name || parsed.toolCall?.name;
      const input = parsed.input !== undefined ? parsed.input : (parsed.toolUseEvent?.input || parsed.toolCall?.arguments);
      const stop = parsed.stop || false;

      return {
        type: 'tool_use',
        toolUseId,
        name,
        input,
        stop
      };
    }

    const textChunk =
      parsed.assistantResponseEvent?.content ||
      parsed.assistantResponseMessage?.content ||
      parsed.content ||
      parsed.text ||
      parsed.delta?.text;

    if (textChunk !== undefined && typeof textChunk === 'string') {
      fullText += textChunk;
      if (options.onChunk) {
        options.onChunk(textChunk);
      }
      return textChunk;
    }

    if (parsed.metadataEvent?.stopReason) {
      stopReason = parsed.metadataEvent.stopReason;
    }
    return null;
  };

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let rawBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunkStr = decoder.decode(value, { stream: true });
    rawBuffer += chunkStr;

    if (isBinaryEventStream) {
      let searchIdx = 0;
      while (searchIdx < rawBuffer.length) {
        const startIdx = rawBuffer.indexOf('{', searchIdx);
        if (startIdx === -1) break;

        let depth = 0;
        let endIdx = -1;
        let inString = false;
        let escapeNext = false;

        for (let i = startIdx; i < rawBuffer.length; i++) {
          const char = rawBuffer[i];
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          if (char === '"') {
            inString = !inString;
            continue;
          }
          if (!inString) {
            if (char === '{') depth++;
            else if (char === '}') {
              depth--;
              if (depth === 0) {
                endIdx = i;
                break;
              }
            }
          }
        }

        if (endIdx !== -1) {
          const candidate = rawBuffer.substring(startIdx, endIdx + 1);
          try {
            const parsed = JSON.parse(candidate);
            const res = processJsonObject(parsed);
            if (res) yield res;
            rawBuffer = rawBuffer.substring(endIdx + 1);
            searchIdx = 0;
          } catch {
            searchIdx = startIdx + 1;
          }
        } else {
          break;
        }
      }
    } else {
      const lines = rawBuffer.split('\n');
      rawBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let jsonStr = '';
        if (trimmed.startsWith('data: ')) {
          jsonStr = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          jsonStr = trimmed;
        }

        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const res = processJsonObject(parsed);
          if (res) yield res;
        } catch {
          // ignore
        }
      }
    }
  }

  return { fullText, stopReason, events };
}

// Instantiate Hono App
const app = new Hono();

// Enable Global CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'anthropic-version', 'anthropic-beta'],
}));

// Health Check
app.get('/health', (c) => {
  const creds = getLiveKiroCredentials();
  return c.json({
    status: 'ok',
    service: 'MakeThemBroke Hono EC2 Gateway',
    domain: process.env.DOMAIN || 'makethembroke.com',
    hasToken: Boolean(creds.authToken),
    hasProfileArn: Boolean(creds.profileArn),
    modelId: process.env.MODEL_ID || 'gpt-5.6-sol'
  });
});

// GET /v1/models
app.get('/v1/models', (c) => {
  return c.json({
    data: [
      { id: 'gpt-5.6-sol', type: 'model', created_at: Date.now() },
      { id: 'claude-3-5-sonnet-20241022', type: 'model', created_at: Date.now() },
      { id: 'claude-haiku-4-5', type: 'model', created_at: Date.now() },
      { id: 'claude-haiku-4-5-20251001', type: 'model', created_at: Date.now() },
      { id: 'deepseek-v4-pro', type: 'model', created_at: Date.now() }
    ]
  });
});

// POST /v1/messages/count_tokens
app.post('/v1/messages/count_tokens', (c) => {
  return c.json({ input_tokens: 15 });
});

// POST /v1/messages (and nested routes)
const handleAnthropicMessages = async (c: any) => {
  let body: any = {};
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const isStream = body.stream !== false;
  const model = body.model || 'gpt-5.6-sol';
  const incomingTools = Array.isArray(body.tools) ? body.tools : [];

  let promptParts: string[] = [];
  if (body.system) {
    if (typeof body.system === 'string') promptParts.push(body.system);
    else if (Array.isArray(body.system)) {
      promptParts.push(body.system.map((s: any) => (typeof s === 'string' ? s : s.text || JSON.stringify(s))).join('\n'));
    }
  }

  promptParts.push(
    'IMPORTANT INSTRUCTION: Respond ONLY by calling the appropriate tool (such as Edit, Write, Bash, Glob, Grep) directly. Do not output planning recaps or text descriptions.'
  );

  if (Array.isArray(body.messages)) {
    for (const msg of body.messages) {
      const role = (msg.role || 'user').toUpperCase();
      let contentStr = '';
      if (typeof msg.content === 'string') {
        contentStr = msg.content;
      } else if (Array.isArray(msg.content)) {
        contentStr = msg.content
          .map((part: any) => {
            if (part.type === 'text') return part.text;
            if (part.type === 'tool_result') {
              const resContent = typeof part.content === 'string' ? part.content : JSON.stringify(part.content);
              return `[TOOL RESULT for ID ${part.tool_use_id || 'unknown'}]:\n${resContent}`;
            }
            if (part.type === 'tool_use') {
              return `[ASSISTANT EXECUTED TOOL: ${part.name} (ID: ${part.id}) with input: ${JSON.stringify(part.input)}]`;
            }
            return JSON.stringify(part);
          })
          .join('\n');
      }
      promptParts.push(`${role}: ${contentStr}`);
    }
  }

  const prompt = promptParts.join('\n\n') || 'Hello';

  if (isStream) {
    return streamSSE(c, async (stream) => {
      const msgId = `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      await stream.writeSSE({
        event: 'message_start',
        data: JSON.stringify({
          type: 'message_start',
          message: {
            id: msgId,
            type: 'message',
            role: 'assistant',
            model: model,
            content: [],
            stop_reason: null,
            stop_sequence: null,
            usage: { input_tokens: Math.max(10, Math.floor(prompt.length / 4)), output_tokens: 1 }
          }
        })
      });

      await stream.writeSSE({
        event: 'content_block_start',
        data: JSON.stringify({
          type: 'content_block_start',
          index: 0,
          content_block: { type: 'text', text: '' }
        })
      });

      let totalOutputChars = 0;
      let blockIndex = 0;
      let currentToolBlockIndex: number | null = null;
      let hasCalledTool = false;

      try {
        const generator = streamKiroResponseGenerator({ prompt, tools: incomingTools, modelId: model });
        for await (const chunk of generator) {
          if (typeof chunk === 'string') {
            totalOutputChars += chunk.length;
            await stream.writeSSE({
              event: 'content_block_delta',
              data: JSON.stringify({
                type: 'content_block_delta',
                index: 0,
                delta: { type: 'text_delta', text: chunk }
              })
            });
          } else if (chunk && chunk.type === 'tool_use') {
            hasCalledTool = true;
            if (currentToolBlockIndex === null) {
              blockIndex++;
              currentToolBlockIndex = blockIndex;
              await stream.writeSSE({
                event: 'content_block_start',
                data: JSON.stringify({
                  type: 'content_block_start',
                  index: currentToolBlockIndex,
                  content_block: {
                    type: 'tool_use',
                    id: chunk.toolUseId || `toolu_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
                    name: chunk.name || 'tool',
                    input: {}
                  }
                })
              });
            }

            if (chunk.input !== undefined) {
              const partialJson = typeof chunk.input === 'string' ? chunk.input : JSON.stringify(chunk.input);
              await stream.writeSSE({
                event: 'content_block_delta',
                data: JSON.stringify({
                  type: 'content_block_delta',
                  index: currentToolBlockIndex,
                  delta: { type: 'input_json_delta', partial_json: partialJson }
                })
              });
            }

            if (chunk.stop) {
              await stream.writeSSE({
                event: 'content_block_stop',
                data: JSON.stringify({
                  type: 'content_block_stop',
                  index: currentToolBlockIndex
                })
              });
              currentToolBlockIndex = null;
            }
          }
        }

        if (currentToolBlockIndex !== null) {
          await stream.writeSSE({
            event: 'content_block_stop',
            data: JSON.stringify({
              type: 'content_block_stop',
              index: currentToolBlockIndex
            })
          });
        }
      } catch (err: any) {
        await stream.writeSSE({
          event: 'content_block_delta',
          data: JSON.stringify({
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text_delta', text: `\n[Error: ${err.message}]` }
          })
        });
      }

      await stream.writeSSE({
        event: 'content_block_stop',
        data: JSON.stringify({
          type: 'content_block_stop',
          index: 0
        })
      });

      const finalStopReason = hasCalledTool ? 'tool_use' : 'end_turn';

      await stream.writeSSE({
        event: 'message_delta',
        data: JSON.stringify({
          type: 'message_delta',
          delta: { stop_reason: finalStopReason, stop_sequence: null },
          usage: { output_tokens: Math.max(1, Math.floor(totalOutputChars / 4)) }
        })
      });

      await stream.writeSSE({
        event: 'message_stop',
        data: JSON.stringify({ type: 'message_stop' })
      });
    });
  } else {
    try {
      const generator = streamKiroResponseGenerator({ prompt, tools: incomingTools, modelId: model });
      let fullText = '';
      for await (const chunk of generator) {
        if (typeof chunk === 'string') fullText += chunk;
      }
      return c.json({
        id: `msg_${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: fullText }],
        model: model,
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: Math.max(10, Math.floor(prompt.length / 4)), output_tokens: Math.max(1, Math.floor(fullText.length / 4)) }
      });
    } catch (err: any) {
      return c.json({ error: { type: 'api_error', message: err.message } }, 500);
    }
  }
};

app.post('/v1/messages', handleAnthropicMessages);
app.post('/v1/messages/*', handleAnthropicMessages);

// Standard SSE endpoint for web stream clients
app.post('/stream', async (c) => {
  let prompt = '';
  try {
    const body = await c.req.json();
    prompt = body.prompt || '';
  } catch {
    // ignore
  }

  if (!prompt) return c.json({ error: 'Missing prompt parameter' }, 400);

  return streamSSE(c, async (stream) => {
    try {
      const generator = streamKiroResponseGenerator({ prompt });
      for await (const chunk of generator) {
        if (typeof chunk === 'string') {
          await stream.writeSSE({ data: JSON.stringify({ chunk, done: false }) });
        }
      }
      await stream.writeSSE({ data: JSON.stringify({ done: true }) });
    } catch (err: any) {
      await stream.writeSSE({ data: JSON.stringify({ error: err.message, done: true }) });
    }
  });
});

// Interactive Web UI Dashboard
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MakeThemBroke EC2 Hono AI Gateway</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card: #131b2e;
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --text: #f8fafc;
      --subtext: #94a3b8;
      --border: #1e293b;
    }
    body {
      font-family: 'Outfit', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #a855f7, #6366f1, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }
    .header p { color: var(--subtext); font-size: 1.1rem; margin-top: 8px; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      background: #22c55e20;
      color: #4ade80;
      border: 1px solid #22c55e40;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    textarea {
      width: 100%;
      height: 100px;
      background: var(--bg);
      border: 1px solid var(--border);
      color: #fff;
      padding: 14px;
      border-radius: 10px;
      box-sizing: border-box;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
    }
    button {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 14px;
      transition: all 0.2s;
    }
    button:hover { transform: translateY(-2px); box-shadow: 0 4px 20px var(--accent-glow); }
    #output {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 18px;
      border-radius: 10px;
      min-height: 140px;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 0.95rem;
      color: #e2e8f0;
    }
    code { background: #1e293b; padding: 2px 6px; border-radius: 4px; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">● EC2 HOSTING READY</span>
    <h1>MakeThemBroke AI Gateway</h1>
    <p>Hono SSE Proxy for Claude Code CLI & Custom Applications</p>
  </div>

  <div class="card">
    <h3>📡 Endpoint Specs</h3>
    <p>Anthropic Messages API: <code>/v1/messages</code></p>
    <p>Models List: <code>/v1/models</code></p>
    <p>Health Check: <code>/health</code></p>
  </div>

  <div class="card">
    <h3>🧪 Test Stream Request</h3>
    <textarea id="prompt">Explain Hono web framework features in 2 sentences.</textarea>
    <button onclick="sendStream()">Execute Stream</button>
  </div>

  <div class="card">
    <h3>⚡ Live Output Stream</h3>
    <div id="output">Waiting for request...</div>
  </div>

  <script>
    async function sendStream() {
      const prompt = document.getElementById('prompt').value;
      const output = document.getElementById('output');
      output.innerText = 'Connecting to Hono Stream...\\n';
      try {
        const res = await fetch('/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        output.innerText = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          for (const line of text.split('\\n')) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.chunk) output.innerText += data.chunk;
              } catch(e){}
            }
          }
        }
      } catch (e) {
        output.innerText += '\\nError: ' + e.message;
      }
    }
  </script>
</body>
</html>
  `);
});

const port = Number(process.env.PORT) || 3000;

// Export default object for Bun execution
export default {
  port,
  fetch: app.fetch
};

// Start Node server only if running under standard Node.js (not Bun)
if (typeof (globalThis as any).Bun === 'undefined') {
  serve({
    fetch: app.fetch,
    port
  }, (info) => {
    console.log(`\n======================================================`);
    console.log(`🚀 MakeThemBroke Hono EC2 Gateway Running (Node.js)`);
    console.log(`🌐 Dashboard          : http://localhost:${info.port}`);
    console.log(`🤖 Anthropic API Endpoint: http://localhost:${info.port}/v1/messages`);
    console.log(`📡 SSE Stream Endpoint   : http://localhost:${info.port}/stream`);
    console.log(`======================================================\n`);
  });
}
