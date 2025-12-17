export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

/**
 * Shuffles the options array and updates the correctAnswer index accordingly
 */
function shuffleOptions(question: Question): Question {
  const { options, correctAnswer } = question;

  // Create array of indices
  const indices = options.map((_, i) => i);

  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Create shuffled options and find new correct answer index
  const shuffledOptions = indices.map(i => options[i]);
  const newCorrectAnswer = indices.indexOf(correctAnswer);

  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswer
  };
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

    IMPORTANT: Vary the position of correct answers. Don't always put the correct answer at index 0.
    Mix up the correct answer positions across different questions for better quiz quality.

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

      // Shuffle options for each question to randomize answer positions
      const shuffledQuestions = questions.map((q: Question) => shuffleOptions(q));

      console.log('Generated questions with shuffled options:', shuffledQuestions.map((q: Question) => ({
        id: q.id,
        correctAnswer: q.correctAnswer,
        correctOption: q.options[q.correctAnswer]
      })));

      return shuffledQuestions;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Content:", content);
      throw new Error("Failed to parse AI response. The model might be overloaded. Please try again.");
    }

  } catch (error: any) {
    console.error("Error generating questions:", error);
    throw new Error(error.message || "Failed to generate questions. Please check your API key and try again.");
  }
}
