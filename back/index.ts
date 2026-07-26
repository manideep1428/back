import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const port = Number(process.env.PORT) || 3001;
const convexUrl = process.env.CONVEX_URL || "https://tremendous-grasshopper-313.convex.cloud";
const internalBackendUrl = (process.env.INTERNAL_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");

const convexClient = new ConvexHttpClient(convexUrl, { skipConvexDeploymentUrlCheck: true });

/**
 * Calculates USD cost based on pricing:
 * Opus 5: $5 / 1M input, $25 / 1M output
 * GPT-5.6-sol: $5 / 1M input, $15 / 1M output
 */
function calculateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const norm = (model || "").toLowerCase();
  let inputRate = 5.0; // $5 / 1M tokens
  let outputRate = 15.0; // Default $15 / 1M tokens

  if (norm.includes("opus 5") || norm.includes("opus-5") || norm.includes("opus")) {
    outputRate = 25.0; // $25 / 1M tokens for Opus 5
  } else if (norm.includes("gpt-5.6-sol") || norm.includes("gpt-5.6") || norm.includes("sol")) {
    outputRate = 15.0; // $15 / 1M tokens for GPT-5.6-sol
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

/**
 * Handles incoming proxy requests for /v1/anthropic and /v1/openai
 */
async function handleProxyRequest(req: Request): Promise<Response> {
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
    return new Response(
      JSON.stringify({
        error: {
          message: "MakeThemBroke API key missing. Pass key via Authorization: Bearer mb-live-... or x-api-key header.",
          type: "authentication_error",
          param: null,
          code: "invalid_api_key",
        },
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // Check if endpoint is under construction (Codex / OpenAI endpoint)
  if (path.includes("/openai") || path.includes("/chat/completions")) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Codex / OpenAI gateway endpoint is currently under construction and frozen. Please route requests through /v1/anthropic for Claude Code.",
          type: "under_construction_error",
          param: null,
          code: "endpoint_under_construction",
        },
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  // Check key and credit limits in Convex DB
  const validation = await validateKey(apiKey);
  if (!validation.valid) {
    return new Response(
      JSON.stringify({
        error: {
          message: validation.reason || "Your MakeThemBroke $2.50 trial credit balance has been exhausted ($0.00). Please visit https://makethembroke.com/pricing to add funds to your account.",
          type: "insufficient_quota",
          param: null,
          code: "credit_limit_exceeded",
        },
      }),
      {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
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

  const requestedModel = reqBodyJson.model || "gpt-5.6-sol";
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
    return new Response(
      JSON.stringify({
        error: {
          message: "MakeThemBroke Gateway Error: Unable to connect to upstream processing server.",
          type: "backend_connection_error",
        },
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
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

    return new Response(
      JSON.stringify({
        error: {
          message: sanitizedMsg,
          type: "gateway_error",
        },
      }),
      {
        status: backendResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
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

          // Forward chunk immediately to client
          controller.enqueue(value);

          // Inspect text chunk for token usage
          const textChunk = decoder.decode(value, { stream: true });
          sseBuffer += textChunk;
          totalOutputChars += textChunk.length;

          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.message?.usage?.input_tokens) {
                  inputTokens = parsed.message.usage.input_tokens;
                }
                if (parsed.usage?.input_tokens) {
                  inputTokens = parsed.usage.input_tokens;
                }
                if (parsed.usage?.output_tokens) {
                  outputTokens = parsed.usage.output_tokens;
                }
              } catch {
                // Ignore JSON parse errors for non-JSON lines
              }
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();

        // Calculate fallback tokens if not explicitly in stream
        if (inputTokens === 0) {
          const promptLength = JSON.stringify(reqBodyJson.messages || []).length;
          inputTokens = Math.max(15, Math.ceil(promptLength / 4));
        }
        if (outputTokens === 0) {
          outputTokens = Math.max(1, Math.ceil(totalOutputChars / 4));
        }

        const latencyMs = Date.now() - startTime;
        const costUsd = calculateCostUsd(requestedModel, inputTokens, outputTokens);

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

// Start Bun Server
export default {
  port,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, anthropic-version, anthropic-beta",
        },
      });
    }

    // Health check endpoint
    if (path === "/" || path === "/health" || path === "/v1/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "MakeThemBroke Public API Billing Gateway",
          baseUrl: "https://api.makethembroke.com/v1",
          convexUrl,
          internalBackendUrl,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Supported API Gateway Endpoints:
    // /v1/anthropic, /v1/openai, /v1/messages, /v1/chat/completions, /anthropic, /openai
    if (
      path.startsWith("/v1/anthropic") ||
      path.startsWith("/v1/openai") ||
      path.startsWith("/v1/messages") ||
      path.startsWith("/v1/chat/completions") ||
      path.startsWith("/anthropic") ||
      path.startsWith("/openai")
    ) {
      if (req.method === "POST") {
        return handleProxyRequest(req);
      }
    }

    return new Response(
      JSON.stringify({
        error: {
          message: `Endpoint ${path} not found. Use /v1/anthropic or /v1/openai for streaming API requests.`,
          type: "not_found",
        },
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  },
};

console.log(`\n======================================================`);
console.log(`🚀 MakeThemBroke Public API Gateway Running (Bun)`);
console.log(`🌐 Base URL            : http://localhost:${port}/v1`);
console.log(`🤖 Anthropic Stream API: http://localhost:${port}/v1/anthropic`);
console.log(`⚡ OpenAI Stream API   : http://localhost:${port}/v1/openai`);
console.log(`📊 Convex DB Connected : ${convexUrl}`);
console.log(`======================================================\n`);
