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

    try {
      let body = {};

      try {
        body = await request.json();
      } catch (e) {
        body = {};
      }

      const userMessage =
        body.message ||
        body?.messages?.[body.messages.length - 1]?.content ||
        "";

      if (!userMessage) {
        return new Response(JSON.stringify({ reply: "No message received" }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      const text = userMessage.toLowerCase();

      const kb = {
        visa: "Visa: 3–15 days processing, passport required.",
        jobs: "Jobs: BPO, admin, sales roles available.",
        education: "Education: MBBS, MBA abroad options.",
        travel: "Travel: Holiday + visa packages.",
        company: "We Fill It: Study abroad + visa services."
      };

      let context = "";

      if (text.includes("visa")) context += kb.visa + "\n";
      if (text.includes("job")) context += kb.jobs + "\n";
      if (text.includes("study") || text.includes("education")) context += kb.education + "\n";
      if (text.includes("travel")) context += kb.travel + "\n";
      if (text.includes("company")) context += kb.company + "\n";

      // OPENROUTER CALL (SAFE)
      const aiResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://wefillit.in",
            "X-Title": "We Fill It AI"
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct",
            messages: [
              {
                role: "system",
                content: `You are We Fill It AI assistant. Use context:\n${context}`
              },
              {
                role: "user",
                content: userMessage
              }
            ]
          })
        }
      );

      // 🔥 IMPORTANT SAFE PARSING
      const textResponse = await aiResponse.text();

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        return new Response(JSON.stringify({
          reply: "AI parsing error",
          raw: textResponse
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.error?.message ||
        "No response available";

      return new Response(JSON.stringify({ reply }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        reply: "Server error",
        debug: err?.message
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
