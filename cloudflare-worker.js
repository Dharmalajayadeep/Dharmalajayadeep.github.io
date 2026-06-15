
export default {
  async fetch(request, env) {

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    const { messages } = await request.json();

    const userMessage = messages?.[messages.length - 1]?.content || "";

    // =========================
    // 🧠 KNOWLEDGE BASE (START)
    // =========================

    const knowledgeBase = {
      visa: `
Visa Info:
- Tourist visa requires valid passport
- Processing time: 3–15 days
- Common countries: USA, UK, Canada, Schengen
      `,

      jobs: `
Jobs Info:
- Entry roles: BPO, Admin, Sales
- Requirements: basic English + computer skills
- Remote jobs also available
      `,

      education: `
Education Abroad:
- MBBS, MS, MBA popular courses
- Countries: UK, Germany, USA, Australia
      `,

      travel: `
Travel Services:
- Holiday packages available
- Visa + hotel + flight combo
      `,

      company: `
We Fill It:
- Overseas education consultancy
- HR solutions
- Visa assistance
      `
    };

    // =========================
    // 🧠 SIMPLE CONTEXT ENGINE
    // =========================

    let context = "";

    const lower = userMessage.toLowerCase();

    if (lower.includes("visa")) context += knowledgeBase.visa;
    if (lower.includes("job")) context += knowledgeBase.jobs;
    if (lower.includes("study") || lower.includes("education")) context += knowledgeBase.education;
    if (lower.includes("travel") || lower.includes("holiday")) context += knowledgeBase.travel;
    if (lower.includes("company") || lower.includes("we fill")) context += knowledgeBase.company;

    // =========================
    // 🤖 OPENROUTER CALL
    // =========================

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are We Fill It AI assistant.

Use this knowledge base if relevant:
${context}

Rules:
- Be concise
- Be helpful
- If unsure, ask follow-up question
            `
          },
          ...messages
        ]
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify({
      reply: data.choices?.[0]?.message?.content || "No response"
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
