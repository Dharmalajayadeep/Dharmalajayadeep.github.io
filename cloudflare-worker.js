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
          `https://raw.githubusercontent.com/Dharmalajayadeep/Dharmalajayadeep.github.io/main/${path}`;

        const response = await fetch(url);

        if (!response.ok) {
          return "";
        }

        return await response.text();

      } catch (error) {
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
      if (
        text.includes("travel") ||
        text.includes("holiday") ||
        text.includes("trip") ||
        text.includes("vacation")
      ) {
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
8. When discussing travel, provide:
   - Destination
   - Budget
   - Suggested Itinerary
   - Information Required From Traveler
9. Never answer in one large paragraph.

LEAD COLLECTION RULE:

If the user shows interest in:
- Study Abroad
- Student Visa
- Tourist Visa
- Jobs Abroad
- Travel Packages

Always ask:

📋 Required Details:
• Full Name
• Mobile Number
• Email Address
• Destination Country

For Study Abroad also ask:
• Preferred Course
• Preferred Intake

For Jobs also ask:
• Resume
• Experience
• Expected Salary

COMPANY DETAILS:

We Fill It
Website: wefillit.in
WhatsApp: +91 9182692826

Use ONLY the knowledge base provided below.

KNOWLEDGE BASE:

${context}
`
  },
              {
                role: "user",
                content: userMessage
              }
            ],
            temperature: 0.4,
            max_tokens: 700
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
