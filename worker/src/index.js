/**
 * Cloudflare Worker for the L'Oréal Routine Builder.
 * Uses OpenAI Responses API with the web_search_preview tool
 * so the model can search the web in real time.
 */

function createCorsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
}

function extractAssistantText(output) {
  for (const item of output) {
    if (item.type === "message" && item.role === "assistant") {
      return item.content
        .filter((c) => c.type === "output_text")
        .map((c) => c.text)
        .join("");
    }
  }
  return "";
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST requests are allowed." }), {
        status: 405,
        headers: createCorsHeaders(),
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload." }), {
        status: 400,
        headers: createCorsHeaders(),
      });
    }

    const { messages } = payload;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "The request body must include a non-empty messages array." }), {
        status: 400,
        headers: createCorsHeaders(),
      });
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        instructions:
          "You are a knowledgeable beauty advisor specializing in L'Oréal family brands. " +
          "Use web search to provide current, accurate information about products and routines. " +
          "Always cite your sources with the full URL when you use web search results.",
        input: messages,
      }),
    });

    const responseBody = await openAiResponse.text();
    const headers = createCorsHeaders();

    if (!openAiResponse.ok) {
      return new Response(responseBody, {
        status: openAiResponse.status,
        headers,
      });
    }

    let result;
    try {
      result = JSON.parse(responseBody);
    } catch {
      return new Response(JSON.stringify({ error: "Unable to parse OpenAI response." }), {
        status: 502,
        headers,
      });
    }

    const assistantText = extractAssistantText(result.output ?? []);
    return new Response(JSON.stringify({ assistant: assistantText, raw: result }), {
      status: 200,
      headers,
    });
  },
};
