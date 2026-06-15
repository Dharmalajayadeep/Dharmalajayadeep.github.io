const fs = require("fs");
const path = require("path");

function readFolder(folderPath) {
  let content = "";

  if (!fs.existsSync(folderPath)) {
    return content;
  }

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const fullPath = path.join(folderPath, file);

    if (fs.statSync(fullPath).isFile()) {
      content += "\n\n";
      content += fs.readFileSync(fullPath, "utf8");
    }
  }

  return content;
}

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    const knowledgeBase =
      readFolder(path.join(process.cwd(), "We Fill It AI knowledge base", "Company")) +
      readFolder(path.join(process.cwd(), "We Fill It AI knowledge base", "Education")) +
      readFolder(path.join(process.cwd(), "We Fill It AI knowledge base", "Jobs")) +
      readFolder(path.join(process.cwd(), "We Fill It AI knowledge base", "Travel")) +
      readFolder(path.join(process.cwd(), "We Fill It AI knowledge base", "Visa"));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
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
              content: `
You are We Fill It AI, the official assistant of We Fill It Overseas Education.

Knowledge Base:

${knowledgeBase}

Rules:
- Use the knowledge base whenever possible.
- Help with visas, overseas education, MBBS abroad, jobs and travel.
- If information is not available, ask the user to contact We Fill It.
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
