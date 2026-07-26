import { Hono } from "hono";
import { cors } from "hono/cors";
import { ConvexClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

// Enable CORS for all origins
app.use("*", cors());

const convexUrl = process.env.CONVEX_URL || "https://tremendous-grasshopper-313.convex.cloud";
const internalBackendUrl = process.env.INTERNAL_BACKEND_URL || "http://ec2-13-201-21-231.ap-south-1.compute.amazonaws.com:3000";
const port = parseInt(process.env.PORT || "3001", 10);

const convexClient = new ConvexClient(convexUrl);

/**
 * Calculates usage cost in USD based on requested model and token counts
 */
function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  let inputRate = 5.0; // default per 1M tokens
  let outputRate = 25.0; // default per 1M tokens

  const norm = model.toLowerCase();
  if (norm.includes("sonnet-5")) {
    inputRate = 3.0;
    outputRate = 15.0;
  } else if (norm.includes("sol")) {
    inputRate = 5.0;
    outputRate = 15.0;
  } else if (norm.includes("luna")) {
    inputRate = 1.5;
    outputRate = 6.0;
  } else if (norm.includes("auto")) {
    inputRate = 3.0;
    outputRate = 12.0;
  }

  const inputCost = (inputTokens / 1_000_000) * inputRate;
  const outputCost = (outputTokens / 1_000_000) * outputRate;
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}

/**
 * Validates API Key & credit balance against Convex
 */
async function validateKey(key: string) {
  try {
    const res = await (convexClient.query as any)("usage:validateApiKey", { key });
    return res;
  } catch (err: any) {
    console.error("Convex Key Validation Error:", err.message);
    return { valid: false, reason: "Failed to connect to authentication server." };
  }
}

/**
 * Records token usage and deducts user credit in Convex DB
 */
async function recordUsage(data: {
  key: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  status: string;
}) {
  try {
    await (convexClient.mutation as any)("usage:recordUsageAndDeductCredit", data);
  } catch (err: any) {
    console.error("Convex Usage Logging Error:", err.message);
  }
}

// Health check endpoints
app.get("/", (c) => c.json({ status: "ok", service: "MakeThemBroke Hono Billing Gateway", baseUrl: "/v1", convexUrl, internalBackendUrl }));
app.get("/health", (c) => c.json({ status: "ok", service: "MakeThemBroke Hono Billing Gateway", baseUrl: "/v1", convexUrl, internalBackendUrl }));
app.get("/v1/health", (c) => c.json({ status: "ok", service: "MakeThemBroke Hono Billing Gateway", baseUrl: "/v1", convexUrl, internalBackendUrl }));

/**
 * Handles incoming proxy requests for /v1/anthropic and /v1/openai
 */
async function handleProxy(c: any) {
  const req = c.req.raw;
  const url = new URL(req.url);
  const path = url.pathname;

  // Extract API key from headers
  const authHeader = req.headers.get("authorization") || "";
  const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("api-key") || "";
  let apiKey = apiKeyHeader.trim();

  if (!apiKey && authHeader.toLowerCase().startsWith("bearer ")) {
    apiKey = authHeader.substring(7).trim();
  }

  if (!apiKey) {
    return c.json(
      {
        error: {
          message: "MakeThemBroke API key missing. Pass key via Authorization: Bearer mb-live-... or x-api-key header.",
          type: "authentication_error",
          param: null,
          code: "invalid_api_key",
        },
      },
      401
    );
  }

  // Check if endpoint is under construction (Codex / OpenAI endpoint)
  if (path.includes("/openai") || path.includes("/chat/completions")) {
    return c.json(
      {
        error: {
          message: "Codex / OpenAI gateway endpoint is currently under construction. Please route requests through /v1/anthropic for Claude Code.",
          type: "under_construction_error",
          param: null,
          code: "endpoint_under_construction",
        },
      },
      503
    );
  }

  // Check key and credit limits in Convex DB
  const validation = await validateKey(apiKey);
  if (!validation.valid) {
    return c.json(
      {
        error: {
          message: validation.reason || "Your MakeThemBroke $2.50 trial credit balance has been exhausted ($0.00). Please visit https://makethembroke.com/pricing to add funds to your account.",
          type: "insufficient_quota",
          param: null,
          code: "credit_limit_exceeded",
        },
      },
      402
    );
  }

  // Read request body
  let reqBodyJson: any = {};
  let rawBodyText = "";
  try {
    rawBodyText = await req.text();
    reqBodyJson = JSON.parse(rawBodyText || "{}");
  } catch {
    reqBodyJson = {};
  }

  const requestedModel = reqBodyJson.model || "claude-opus-5";
  const startTime = Date.now();

  // Forward request to internal backend
  const targetUrl = `${internalBackendUrl}/v1/messages`;
  let backendResponse: Response;

  try {
    const forwardHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    };
    if (req.headers.get("anthropic-version")) {
      forwardHeaders["anthropic-version"] = req.headers.get("anthropic-version")!;
    }
    if (req.headers.get("anthropic-beta")) {
      forwardHeaders["anthropic-beta"] = req.headers.get("anthropic-beta")!;
    }

    backendResponse = await fetch(targetUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: rawBodyText || JSON.stringify(reqBodyJson),
    });
  } catch (err: any) {
    return c.json(
      {
        error: {
          message: "MakeThemBroke Gateway Error: Unable to connect to upstream processing server.",
          type: "backend_connection_error",
        },
      },
      502
    );
  }

  if (!backendResponse.ok || !backendResponse.body) {
    const errText = await backendResponse.text().catch(() => "");
    let sanitizedMsg = "MakeThemBroke Gateway Error: Service temporary connection issue.";

    if (backendResponse.status === 402 || errText.includes("credit") || errText.includes("exhausted")) {
      sanitizedMsg = "Your MakeThemBroke $2.50 trial credit balance has been exhausted ($0.00). Please visit https://makethembroke.com/pricing to add funds to your account.";
    } else if (backendResponse.status === 403 || errText.includes("Forbidden") || errText.includes("token")) {
      sanitizedMsg = "MakeThemBroke Gateway Service: Automatic session refresh in progress. Please retry your request in a moment.";
    } else {
      sanitizedMsg = `MakeThemBroke Gateway Service Error (${backendResponse.status}). Please check your account status at https://makethembroke.com/dashboard.`;
    }

    return c.json(
      {
        error: {
          message: sanitizedMsg,
          type: "gateway_error",
        },
      },
      backendResponse.status as any
    );
  }

  // Token tracking accumulators
  let inputTokens = 0;
  let outputTokens = 0;
  let totalOutputChars = 0;
  let sseBuffer = "";

  const decoder = new TextDecoder("utf-8");
  const reader = backendResponse.body.getReader();

  const customStream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          controller.enqueue(value);
          const chunkStr = decoder.decode(value, { stream: true });
          sseBuffer += chunkStr;

          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.slice(6);
              if (dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.usage) {
                  if (parsed.usage.input_tokens) inputTokens = parsed.usage.input_tokens;
                  if (parsed.usage.output_tokens) outputTokens = parsed.usage.output_tokens;
                }
                if (parsed.delta?.text) {
                  totalOutputChars += parsed.delta.text.length;
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Gateway Stream Error:", err.message);
      } finally {
        if (outputTokens === 0 && totalOutputChars > 0) {
          outputTokens = Math.ceil(totalOutputChars / 4);
        }
        if (inputTokens === 0) {
          inputTokens = 150;
        }

        const latencyMs = Date.now() - startTime;
        const costUsd = calculateCost(requestedModel, inputTokens, outputTokens);

        // Deduct credit in Convex DB asynchronously
        recordUsage({
          key: apiKey,
          model: requestedModel,
          inputTokens,
          outputTokens,
          costUsd,
          latencyMs,
          status: "200_OK",
        });
      }
    },
  });

  return new Response(customStream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

// Bind proxy handler to all gateway routes
app.all("/v1/anthropic", handleProxy);
app.all("/v1/anthropic/*", handleProxy);
app.all("/v1/openai", handleProxy);
app.all("/v1/openai/*", handleProxy);
app.all("/v1/messages", handleProxy);
app.all("/v1/chat/completions", handleProxy);
app.all("/anthropic", handleProxy);
app.all("/openai", handleProxy);

export default {
  port,
  fetch: app.fetch,
};

console.log(`\n======================================================`);
console.log(`🚀 MakeThemBroke Hono API Gateway Running`);
console.log(`🌐 Hosted Domain       : https://api.makethembroke.com/v1`);
console.log(`🤖 Anthropic Stream API: https://api.makethembroke.com/v1/anthropic`);
console.log(`⚡ OpenAI Stream API   : https://api.makethembroke.com/v1/openai`);
console.log(`📊 Convex DB Connected : ${convexUrl}`);
console.log(`======================================================\n`);
