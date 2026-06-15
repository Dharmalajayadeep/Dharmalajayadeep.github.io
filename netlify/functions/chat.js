exports.handler = async (event, context) => {
  try {

    const body = JSON.parse(event.body);
    const userMessage = body.message;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://wefillit.in",
        "X-Title": "We Fill It AI"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are We Fill It AI. You help users with student visas, tourist visas, MBBS abroad, overseas education, travel, accommodation, jobs, and career guidance."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reply:
          data?.choices?.[0]?.message?.content ||
          "Sorry, I could not generate a response."
      })
    };

  } catch (error) {

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: error.message
      })
    };

  }
};
