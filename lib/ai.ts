// ==============================
// 🤖 OPENROUTER LLM CALL
// ==============================
async function callLLM(messages: any[], history: any[] = []) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Agent Chat UI",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [...messages, ...history],
    }),
  });

  const data = await res.json();

  console.log("LLM RAW RESPONSE:", data);

  return data?.choices?.[0]?.message?.content;
}

// ==============================
// 🌐 SERPAPI TOOL
// ==============================
async function fetchSerpData(query: string) {
  const res = await fetch(
    `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`
  );

  const data = await res.json();

  const results = data.organic_results?.slice(0, 3) || [];

  return {
    snippets: results.map((r: any) => r.snippet).join("\n"),
    sources: results.map((r: any) => ({
      title: r.title,
      link: r.link,
    })),
  };
}

// ==============================
// 🧠 AGENTIC AI FUNCTION
// ==============================
export async function generateReply(query: string, history: any[] = []) {
  console.log("🧠 AGENT QUERY:", query);

  try {
    // ==========================
    // STEP 1: DECISION MAKING
    // ==========================
    const decision = await callLLM([
      {
        role: "system",
        content: `
You are an intelligent AI agent.

You have tools:

1. SEARCH:<query> → for real-time info
2. CALCULATE:<expression> → for math

Rules:
- Use SEARCH for current info
- Use CALCULATE for math problems
- For math, output ONLY valid math expressions
  Example: CALCULATE:25*12+5
- Do NOT include words in calculation
- For normal answers: ANSWER:<text>

ONLY return:
SEARCH:...
CALCULATE:...
ANSWER:...
`,
      },
      { role: "user", content: query },
    ], history);

    console.log("🧠 AGENT DECISION:", decision);

    // ==========================
    // STEP 2: TOOL USAGE (SERPAPI)
    // ==========================
    if (decision?.startsWith("SEARCH:")) {
      const searchQuery = decision.replace("SEARCH:", "").trim();

      console.log("🔍 USING SERPAPI:", searchQuery);

      const { snippets, sources } = await fetchSerpData(searchQuery);

      // ==========================
      // STEP 3: FINAL ANSWER USING TOOL DATA
      // ==========================
      const finalAnswer = await callLLM([
        {
          role: "system",
          content: `
You are an AI assistant.

Use the provided real-time data to answer clearly and accurately.
`,
        },
        {
          role: "user",
          content: `Real-time Data:\n${snippets}\n\nQuestion: ${query}`,
        },
      ], history);

      return {
        text: finalAnswer || "No response",
        provider: "agent (llama + serpapi)",
        sources,
      };
    }

    // ==========================
    // STEP 4: DIRECT ANSWER
    // ==========================
    if (decision?.startsWith("ANSWER:")) {
      return {
        text: decision.replace("ANSWER:", "").trim(),
        provider: "agent (llama)",
        sources: [],
      };
    }

    // calculator tool
   function calculate(expression: string) {
  try {
    // ✅ Remove words, keep only math symbols
    const cleaned = expression
      .replace(/[^0-9+\-*/().]/g, "") // remove text
      .trim();

    if (!cleaned) return "Invalid calculation";

    const result = Function(`"use strict"; return (${cleaned})`)();

    return result.toString();
  } catch {
    return "Invalid calculation";
  }
}

// 🧮 CALCULATOR TOOL
if (decision?.startsWith("CALCULATE:")) {
  const expression = decision.replace("CALCULATE:", "").trim();

  const result = calculate(expression);

  return {
    text: `Result: ${result}`,
    provider: "agent (calculator)",
    sources: [],
  };
}

    // ==========================
    // STEP 5: FALLBACK
    // ==========================
    return {
      text: decision || "No response",
      provider: "agent",
      sources: [],
    };

  } catch (err) {
    console.error("❌ AGENT ERROR:", err);

    return {
      text: "⚠️ Agent failed",
      provider: "error",
      sources: [],
    };
  }
}