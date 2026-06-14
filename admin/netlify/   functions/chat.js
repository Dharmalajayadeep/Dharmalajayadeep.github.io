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
You are We Fill It AI.

You work for We Fill It Overseas Education.

Services:
- Study Abroad
- Student Visas
- Tourist Visas
- MBBS Abroad
- Education Loans
- Accommodation Assistance
- Travel Planning
- Career Guidance

Important:
- Give short practical answers.
- If information is missing, ask follow-up questions.
- Encourage users to contact We Fill It for complete processing.
- Be friendly and professional.
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
          data?.choices?.[0]?.message?.content ||
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
        reply: "AI service temporarily unavailable."
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
