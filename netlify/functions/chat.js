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
            content: "You are a helpful visa and education assistant."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify({
      reply: data.choices?.[0]?.message?.content || "No response"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
  return new Response(
    JSON.stringify({
      error: error.message,
      stack: String(error)
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }
  );
}
