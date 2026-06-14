export default async (req, context) => {
  try {

    const body = await req.json();
    const userMessage = body.message;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://wefillit.in",
          "X-Title": "We Fill It AI"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: [
            {
              role: "system",
              content: `
You are We Fill It AI Assistant.

You help users with:

- Study Abroad
- MBBS Abroad
- Student Visas
- Tourist Visas
- USA B1/B2 Visas
- Europe Visas
- Education Loans
- Accommodation
- Career Guidance

Company Information:
We Fill It Overseas Education
Based in India

Always answer clearly and professionally.
Keep answers concise.
If information is missing, ask follow-up questions.
`
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        })
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify({
        reply:
          data.choices?.[0]?.message?.content ||
          "Sorry, I couldn't generate a response."
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        reply: "AI server error. Please try again."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  }
};
