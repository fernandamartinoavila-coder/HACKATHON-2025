
export interface JobAd {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  description: string;
  requirements: string[];
  offer: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isCorrection?: boolean;
}

export interface LenguatecaItem {
  category: string;
  dutch: string;
  spanish: string;
}

export type ErrorType = 
  | 'spelling'      // Rood
  | 'missing'       // Blauw
  | 'grammar'       // Geel
  | 'tense'         // Groen (Tijd)
  | 'order'         // Bruin
  | 'choice'        // Groen/Teal (Keuze)
  | 'none';

export interface TextSegment {
  id: string;
  text: string;
  isError: boolean;
  type: ErrorType;
  explanation?: string; // Internal hint for the AI, or displayed if user gives up
}

export interface AnalysisResponse {
  segments: TextSegment[];
  generalFeedback: string;
}

export interface CorrectionResult {
  isCorrect: boolean;
  feedback: string;
  correctedText?: string;
}
