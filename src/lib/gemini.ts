import { GoogleGenAI } from "@google/genai";

function getApiKey(): string {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "undefined" && key !== "MY_GEMINI_API_KEY") {
      return key;
    }
  } catch (e) {
    // process.env might not be defined
  }
  return localStorage.getItem("GEMINI_API_KEY") || "";
}

let cachedClient: { key: string; instance: GoogleGenAI } | null = null;

function getAI(): GoogleGenAI {
  const key = getApiKey();
  if (!key) {
    throw new Error("Gemini API Key is not set. Please configure your API key in Profile settings.");
  }
  if (!cachedClient || cachedClient.key !== key) {
    cachedClient = {
      key,
      instance: new GoogleGenAI({ apiKey: key })
    };
  }
  return cachedClient.instance;
}

export async function chatWithNotes(
  messages: { role: string; content: string }[], 
  notesContext: string,
  inlineDataList?: { data: string; mimeType: string }[]
) {
  try {
    const systemInstruction = `You are an AI study tutor. You help students understand their notes.
    Base your answers primarily on the provided notes context. If the answer is not in the notes, 
    you can use your general knowledge but mention that it's not explicitly in the notes.
    
    Notes Context:
    ${notesContext}`;

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages.map((msg, index) => {
        // Only attach the inlineData to the last user message to provide context
        const parts: any[] = [{ text: msg.content }];
        if (inlineDataList && msg.role === 'user' && index === messages.length - 1) {
          inlineDataList.forEach(inlineData => {
            parts.push({ inlineData });
          });
        }
        return {
          role: msg.role === 'ai' ? 'model' : 'user',
          parts
        };
      }),
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error chatting with notes:", error);
    throw error;
  }
}

export async function generateFlashcards(noteContent: string, inlineData?: { data: string; mimeType: string }) {
  try {
    const prompt = `Generate 5 flashcards based on the following notes. 
    Return the result strictly as a JSON array of objects, where each object has a "front" (question) and "back" (answer) property.
    Do not include any markdown formatting like \`\`\`json in the response, just the raw JSON array.
    
    Notes:
    ${noteContent}`;

    const parts: any[] = [{ text: prompt }];
    if (inlineData) {
      parts.push({ inlineData });
    }

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}

export async function generateSummary(noteContent: string, inlineData?: { data: string; mimeType: string }) {
  try {
    const prompt = `Provide a concise and comprehensive summary of the following notes/document.
    Format the summary using markdown with clear headings or bullet points if necessary.
    
    Notes:
    ${noteContent}`;

    const parts: any[] = [{ text: prompt }];
    if (inlineData) {
      parts.push({ inlineData });
    }

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
      config: {
        temperature: 0.3,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}

export async function generateQuiz(noteContent: string, inlineData?: { data: string; mimeType: string }) {
  try {
    const prompt = `Generate a multiple-choice quiz with 3 questions based on the following notes.
    Return the result strictly as a JSON object with a "title" string and a "questions" array.
    Each question object should have:
    - "id": a number
    - "text": the question string
    - "options": an array of 4 possible answer strings
    - "correctAnswer": the index (0-3) of the correct option
    
    Do not include any markdown formatting like \`\`\`json in the response, just the raw JSON object.
    
    Notes:
    ${noteContent}`;

    const parts: any[] = [{ text: prompt }];
    if (inlineData) {
      parts.push({ inlineData });
    }

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}
