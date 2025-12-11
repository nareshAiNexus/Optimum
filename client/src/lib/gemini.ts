import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function generateQuestions(apiKey: string, text: string, count: number): Promise<Question[]> {
  // Initialize the API
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    ${text.substring(0, 30000)} // Truncate to avoid token limits if necessary
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if present (sometimes the model ignores the instruction)
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const questions = JSON.parse(cleanedText);
    return questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions. Please check your API key and try again.");
  }
}
