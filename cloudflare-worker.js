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
        status: 204,
        headers: corsHeaders
      });
    }

    async function loadFile(path) {
      try {
        const url =
          `https://raw.githubusercontent.com/Dharmalajayadeep/Dharmalajayadeep.github.io/main/We%20Fill%20It%20AI%20knowledge%20base/${path}`;
        const response = await fetch(url);

        if (!response.ok) {
          console.log("Failed:", url);
          return "";
        }

        return await response.text();

      } catch (error) {
        return "";
      }
    }
async function searchWeb(query, env) {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: env.TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        max_results: 10,
        include_answer: true,
        include_raw_content: true
      })
    });

    if (!response.ok) {
      console.log("Tavily Error:", await response.text());
      return "";
    }

    const data = await response.json();
    console.log("Tavily Response:", JSON.stringify(data));

    let results = "";

    if (data.answer) {
      results += `Summary:\n${data.answer}\n\n`;
    }

    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        results += `Title: ${item.title}\n`;
        results += `Content: ${item.content}\n`;
        results += `Source: ${item.url}\n\n`;
      }
    }

    return results;

  } catch (err) {
    console.log(err);
    return "";
  }
}
    try {

      let body = {};

      try {
        body = await request.json();
      } catch {
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

      const travelKeywords = [
        "trip",
        "travel",
        "holiday",
        "vacation",
        "tour",
        "tourism",
        "itinerary",
        "hotel",
        "flight",
        "airport",
        "destination",
        "tourist",
        "beach",
        "island",
        "resort",
        "cruise",
        "honeymoon",
        "backpacking",
        "things to do",
        "places to visit",
        "weather",
        "best time",
        "budget",
        "package",
        "fare",
"price",
"cost",
"ticket",
"tickets",
"airfare",
"flight fare",
"current",
"latest",
"available",
"booking",
"rate",
"rates",
"exchange",
"currency",
"near me",
"restaurants",
"attractions",
"events"
      ];

      const isTravelRequest = travelKeywords.some(keyword =>
        text.includes(keyword)
      );

      let webContext = "";

      if (
  isTravelRequest ||
  text.includes("latest") ||
  text.includes("current") ||
  text.includes("fee") ||
  text.includes("fare") ||
  text.includes("price") ||
  text.includes("cost") ||
  text.includes("today") ||
text.includes("tomorrow") ||
text.includes("this week") ||
text.includes("now")
) {console.log("Tavily Triggered:", userMessage);
        webContext = await searchWeb(userMessage, env);
      }

      // -------------------------
      // KNOWLEDGE BASE LOADING
      // -------------------------

      let context = "";

      // Always load company information
      context += await loadFile("Company/WeFillIt.txt");
     

      // USA / F1
      if (
        text.includes("usa") ||
        text.includes("america") ||
        text.includes("f1") ||
        text.includes("student visa")
      ) {
        context += "\n\n" + await loadFile("Visa/US_F1_Visa.txt");
        context += "\n\n" + await loadFile("Education/USA.txt");
      }

      // France
      if (text.includes("france")) {
        context += "\n\n" + await loadFile("Education/France_Student_Process.txt");
      }

      // MBBS Georgia
      if (
        text.includes("mbbs") ||
        text.includes("georgia")
      ) {
        context += "\n\n" + await loadFile("Education/MBBS_Georgia.txt");
      }

      // Australia Visa
      if (text.includes("australia")) {
        context += "\n\n" + await loadFile("Visa/Australia_Visitor_Visa.txt");
      }

      // China Visa
      if (text.includes("china")) {
        context += "\n\n" + await loadFile("Visa/China_Visit_Visa.txt");
      }

      // Netherlands Visa
      if (
        text.includes("netherlands") ||
        text.includes("schengen")
      ) {
        context += "\n\n" + await loadFile("Visa/Netherlands_Visit_Visa.txt");
      }

      // Jobs
      if (
        text.includes("job") ||
        text.includes("career") ||
        text.includes("resume") ||
        text.includes("work")
      ) {
        context += "\n\n" + await loadFile("Jobs/General.txt");
      }

      // Travel
if (isTravelRequest) {
  context += "\n\n" + await loadFile("Travel/General_Travel_Assistant.txt");
}

      // -------------------------
      // OPENROUTER
      // -------------------------

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
    content: `
You are We Fill It AI, the official AI assistant of We Fill It Global Services.
Company:
We Fill It provides:
- Overseas Education Consulting
- Student Visa Assistance
- Tourist Visa Assistance
- Travel Packages
- HR Solutions
- Job Assistance

Rules:
1. Always use the provided knowledge base first.
2. Never invent visa rules, prices, approvals, or company information.
3. If information is unavailable, clearly say so.
4. For travel-related questions, use live search information when provided.
5. Be professional, friendly, and helpful.
6. Encourage users to contact We Fill It for personalised assistance.

======================
KNOWLEDGE BASE
======================

${context}

======================
LIVE WEB SEARCH
======================

${webContext}
`
  },

  ...(Array.isArray(body.messages) && body.messages.length
    ? body.messages
    : [
        {
          role: "user",
          content: userMessage
        }
      ])
],

  
  temperature: 0.4,
  max_tokens: 1200
})
  
      );

      const textResponse = await aiResponse.text();
console.log("OpenRouter Response:", textResponse);
      if (!aiResponse.ok) {
  return new Response(
    JSON.stringify({
      reply: "OpenRouter API Error",
      debug: textResponse
    }),
    {
      headers: corsHeaders
    }
  );
}
      let data;

      try {
        data = JSON.parse(textResponse);
      } catch {
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
        "Sorry, I could not generate a response.";

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
