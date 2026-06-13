export default async (req, context) => {
  try {
    const body = await req.json();
    const userMessage = body.message;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
You help with:
- Student visas
- Tourist visas
- MBBS abroad
- Education loans
- Travel and accommodation
- Career guidance

Always answer clearly and practically.
If you don't know, ask follow-up questions.
            `
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({
        reply: data.choices[0].message.content
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
};
