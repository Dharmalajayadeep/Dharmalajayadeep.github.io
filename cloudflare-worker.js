export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
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
        return new Response(
          JSON.stringify({
            reply: "No message received"
          }),
          {
            headers: corsHeaders
          }
        );
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
            model: "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are We Fill It AI assistant.

Use this context when relevant:

${context}

Be helpful, professional and concise.`
              },
              {
                role: "user",
                content: userMessage
              }
            ]
          })
        }
      );

      const textResponse = await aiResponse.text();

      let data;

      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        return new Response(
          JSON.stringify({
            reply: "AI parsing error",
            raw: textResponse
          }),
          {
            headers: corsHeaders
          }
        );
      }

      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.error?.message ||
        "No response available";

      return new Response(
        JSON.stringify({
          reply
        }),
        {
          headers: corsHeaders
        }
      );

    } catch (err) {

      return new Response(
        JSON.stringify({
          reply: "Server error",
          debug: err?.message || "Unknown error"
        }),
        {
          headers: corsHeaders
        }
      );

    }
  }
};
