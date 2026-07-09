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
          `https://raw.githubusercontent.com/Dharmalajayadeep/Dharmalajayadeep.github.io/refs/heads/main/We%20Fill%20It%20AI%20knowledge%20base/${path}`;
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
        "visa",
        "budget",
        "package"
      ];

      const isTravelRequest = travelKeywords.some(keyword =>
        text.includes(keyword)
      );

      let webContext = "";

      if (isTravelRequest) {
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
You are We Fill It AI, the official assistant of We Fill It.

IMPORTANT RESPONSE RULES:

1. Always use professional formatting.
2. Never return large paragraphs.
3. Use:
   - Headings
   - Bullet points
   - Numbered steps
   - Tables when helpful
4. Make responses easy to read on mobile phones.
5. When discussing visas, provide:
   - Overview
   - Requirements
   - Process
   - Documents
   - Processing Time
6. When discussing study abroad, provide:
   - Course Information
   - Eligibility
   - Process
   - Required Documents
   - Next Steps
7. When discussing jobs, provide:
   - Requirements
   - Information Needed From Candidate
   - Next Steps
8. When discussing travel, ALWAYS generate a professional travel report using this structure:

🌍 Destination Overview
Before generating an itinerary, determine whether you already have enough information.

If the traveller has NOT provided:

• Departure City
• Departure Date
• Return Date
• Number of Travellers
• Budget

DO NOT guess.

If the user is requesting a complete travel itinerary or budget planner, politely ask ONLY for the missing information before creating the itinerary.

If the user is only asking for general destination information (for example, "Tell me about Thailand" or "Best places to visit in Bali"), answer directly using the knowledge base and LIVE WEB SEARCH without asking for travel details.

Once all required information is available, generate the complete travel report.

📅 Best Time to Visit

🛂 Visa Requirements (if applicable)

✈️ Estimated Flight Cost

Provide only an approximate fare range based on the traveller's departure city and destination.

Never claim to provide live airfare.

State clearly that an exact quotation can be prepared by our travel specialists upon request.

🏨 Estimated Hotel Cost
(Budget / Standard / Luxury)

🍽️ Estimated Food Budget

🚕 Local Transportation

🗓️ Suggested Itinerary
Day 1
Day 2
Day 3
Day 4
Day 5

⭐ Top Attractions

💰 Estimated Total Budget

✅ Travel Tips

Never say "I don't know."
If live search results are available, include them naturally.
9. Never answer in one large paragraph.

LEAD COLLECTION RULE:

For Study Abroad enquiries ask:

• Full Name
• Mobile Number
• Email Address
• Preferred Country
• Preferred Course
• Preferred Intake

For Tourist Visa enquiries ask:

• Full Name
• Mobile Number
• Email Address
• Destination Country
• Travel Date

For Job enquiries ask:

• Full Name
• Mobile Number
• Email Address
• Resume
• Experience
• Expected Salary

For Travel Planning:

If enough travel information is available, generate the complete itinerary.

Otherwise politely ask only for the missing details before creating the itinerary.

Only after generating the itinerary, display:

━━━━━━━━━━━━━━━━━━━━━━

✈️ Want the Best Flight Fare?

Our travel specialists will compare fares across multiple airline booking systems and email you the best available quotation within 1 business hour.

Please provide:

• Full Name
• Email Address
• Mobile Number
• Departure City
• Destination
• Departure Date
• Return Date
• Adults
• Children (if any)

Never mention Riya Travels.

Never mention Cleartrip.

Never mention Skyscanner.

Never promise exact ticket prices.

Only say that a personalised quotation will be emailed.


COMPANY DETAILS:

We Fill It
Website: wefillit.in
WhatsApp: +91 9182692826

Use the We Fill It knowledge base as the primary source for:
- Company services
- Visa information
- Study abroad
- Jobs
- Internal policies

If LIVE WEB SEARCH is provided, use it for:
- Tourist attractions
- Travel itineraries
- Weather
- Best time to visit
- Recent travel updates
- General destination information

If both are available, combine them into one professional answer.

======================
KNOWLEDGE BASE
======================

${context}

When LIVE WEB SEARCH is available:

• Use it as the primary source for destination information.
• Prefer the most recent information.
• Mention notable attractions, weather, local transportation, festivals, and travel tips.
• If multiple reliable sources agree, summarize them naturally.
• Never invent facts that are not present in the knowledge base or live web search.
======================
LIVE WEB SEARCH
======================

${webContext}
`
  },
              {
                role: "user",
                content: userMessage
              }
            ],
            temperature: 0.4,
            max_tokens: 1200
          })
        }
      );

      const textResponse = await aiResponse.text();

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
