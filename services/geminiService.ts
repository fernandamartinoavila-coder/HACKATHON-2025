
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JobAd, AnalysisResponse, CorrectionResult, TextSegment } from '../types';
import { ANALYSIS_PROMPT } from '../constants';

const apiKey = process.env.API_KEY;

const getAiClient = () => new GoogleGenAI({ apiKey });

// --- Schemas ---

const jobSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    company: { type: Type.STRING },
    location: { type: Type.STRING },
    country: { type: Type.STRING },
    description: { type: Type.STRING },
    requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    offer: { type: Type.ARRAY, items: { type: Type.STRING } },
    contactName: { type: Type.STRING },
    contactEmail: { type: Type.STRING },
    contactPhone: { type: Type.STRING },
  },
  required: ["title", "company", "location", "country", "description", "requirements", "offer"],
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    segments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING },
            isError: { type: Type.BOOLEAN },
            type: { type: Type.STRING, enum: ['spelling', 'missing', 'grammar', 'tense', 'order', 'choice', 'none'] },
            explanation: { type: Type.STRING }
        },
        required: ["text", "isError", "type"]
      }
    },
    generalFeedback: { type: Type.STRING }
  }
};

const correctionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: { type: Type.BOOLEAN },
        feedback: { type: Type.STRING },
        correctedText: { type: Type.STRING }
    },
    required: ["isCorrect", "feedback"]
};

// --- Functions ---

export const generateJobAds = async (): Promise<JobAd[]> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    Genereer 3 realistische, uiteenlopende vacatures voor vakantiebanen in Spaanstalige landen (bijv. Spanje, Mexico, Peru, Costa Rica) voor Nederlandse studenten (6 VWO niveau).
    De banen moeten geschikt zijn voor jongeren (bijv. animatieteam, receptie, horeca, gids).
    Zorg dat de tekst in het Spaans is, zoals een echte advertentie.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: jobSchema },
        temperature: 0.8,
      }
    });

    if (response.text) {
      const jobs = JSON.parse(response.text) as JobAd[];
      // Ensure unique IDs
      return jobs.map((job, index) => ({ ...job, id: `generated-${Date.now()}-${index}` }));
    }
    return [];
  } catch (error) {
    console.error("Error generating jobs:", error);
    return [];
  }
};

export const analyzeText = async (text: string, job: JobAd): Promise<AnalysisResponse> => {
    const ai = getAiClient();
    const model = "gemini-2.5-flash"; // Using flash for speed, 2.5 is smart enough for grammar

    const jobContext = `
      TITULO: ${job.title}
      EMPRESA: ${job.company}
      UBICACIÓN: ${job.location}, ${job.country}
      REQUISITOS: ${job.requirements.join(", ")}
    `;

    const prompt = ANALYSIS_PROMPT.replace("{JOB_CONTEXT}", jobContext);

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `ANALYSEER DEZE BRIEF:\n\n${text}`,
            config: {
                systemInstruction: prompt,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.2 // Low temperature for consistent analysis
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text) as AnalysisResponse;
            // Add IDs to segments for React keys
            data.segments = data.segments.map((s, i) => ({ ...s, id: `seg-${i}` }));
            return data;
        }
        throw new Error("Empty response");
    } catch (error) {
        console.error("Analysis error:", error);
        // Fallback for error handling
        return {
            segments: [{ id: 'err', text: text, isError: false, type: 'none' }],
            generalFeedback: "Er ging iets mis bij de analyse. Probeer het later opnieuw."
        };
    }
};

export const validateCorrection = async (
    originalSegment: TextSegment, 
    studentCorrection: string, 
    fullTextContext: string
): Promise<CorrectionResult> => {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";

    const prompt = `
        Je bent een docent Spaans. Een leerling probeert een fout in zijn brief te verbeteren.
        
        Oorspronkelijke foute tekst: "${originalSegment.text}"
        Fouttype: ${originalSegment.type}
        Hint gegeven: ${originalSegment.explanation}
        
        De leerling schrijft nu als verbetering: "${studentCorrection}"
        
        Context van de hele brief: "...${fullTextContext.substring(0, 200)}..."
        
        Beoordeel de verbetering.
        1. Is het nu grammaticaal en contextueel correct?
        2. Geef feedback in het Nederlands. Wees bemoedigend maar streng.
        3. Als het goed is, geef de opgeschoonde versie van de tekst terug (correctedText).
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: correctionSchema,
                temperature: 0.3
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as CorrectionResult;
        }
        throw new Error("Invalid validation response");
    } catch (error) {
        return {
            isCorrect: false,
            feedback: "Kan correctie niet valideren door verbindingsfout."
        };
    }
};
