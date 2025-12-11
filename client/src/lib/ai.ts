export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function generateQuestions(apiKey: string, text: string, count: number): Promise<Question[]> {
  const prompt = `
    You are an expert educator. 
    Analyze the following text content from a syllabus or textbook.
    Generate ${count} multiple-choice questions based on the key concepts in the text.
    
    Return the response ONLY as a valid JSON array of objects. 
    Each object must strictly follow this structure:
    {
      "id": number (1 to ${count}),
      "question": "string",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": number (0-3 index of the correct option)
    }

    Do not include any markdown formatting like \`\`\`json. Just the raw JSON array.

    Text Content:
    ${text.substring(0, 15000)} // Truncate to avoid token limits
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin, // Required by OpenRouter
        "X-Title": "OPTIMUM Question Generator", // Optional, for OpenRouter rankings
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t2-chimera:free", // Updated to the specific requested free model
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Clean up markdown if present (sometimes the model ignores the instruction)
    const cleanedText = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Attempt to parse JSON
    try {
        const questions = JSON.parse(cleanedText);
        return questions;
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Content:", content);
        throw new Error("Failed to parse AI response. The model might be overloaded. Please try again.");
    }

  } catch (error: any) {
    console.error("Error generating questions:", error);
    throw new Error(error.message || "Failed to generate questions. Please check your API key and try again.");
  }
}
