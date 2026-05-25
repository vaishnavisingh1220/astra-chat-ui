import axios from "axios";

export const generateAnswer = async (
  question,
  context
) => {
  try {
    const prompt = `
You are an AI assistant.

Answer the user's question ONLY from the provided context.

If the answer is not present in the context, say:
"I could not find the answer in the uploaded documents."

================ CONTEXT ================

${context}

================ QUESTION ================

${question}

================ ANSWER ================
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "ANSWER GENERATION ERROR =",
      error.message
    );

    throw error;
  }
};