
import { LenguatecaItem, ErrorType } from './types';

export const MAX_FEEDBACK_ATTEMPTS = 3;

export const ERROR_COLORS: Record<ErrorType, string> = {
  'spelling': 'bg-red-100 text-red-900 decoration-red-500',
  'missing': 'bg-blue-100 text-blue-900 decoration-blue-500',
  'grammar': 'bg-yellow-100 text-yellow-900 decoration-yellow-600',
  'tense': 'bg-green-100 text-green-900 decoration-green-600', // Werkwoordstijd
  'order': 'bg-amber-100 text-amber-900 decoration-amber-600', // Bruin-ish for Word Order
  'choice': 'bg-teal-100 text-teal-900 decoration-teal-600',   // Different Green for Word Choice
  'none': 'text-gray-900'
};

export const ERROR_LABELS: Record<ErrorType, string> = {
  'spelling': 'Spelling & Interpunctie',
  'missing': 'Inhoud ontbreekt',
  'grammar': 'Grammatica',
  'tense': 'Werkwoordstijd',
  'order': 'Woordvolgorde',
  'choice': 'Woordkeuze',
  'none': ''
};

export const LENGUATECA: LenguatecaItem[] = [
  // Introductie / Aanleiding
  { category: "Aanleiding", dutch: "In El País van 1 april heb ik uw advertentie gelezen waarin u een ... zoekt.", spanish: "En el País del 1 de abril leí su anuncio en el cual ustedes buscan..." },
  { category: "Aanleiding", dutch: "Ik wil solliciteren naar deze baan.", spanish: "Me gustaría solicitar este empleo." },
  { category: "Aanleiding", dutch: "Ik ben vooral geïnteresseerd in ... omdat ...", spanish: "Estoy particularmente interesado/-a en ... porque ..." },
  
  // Informatie vragen
  { category: "Vragen", dutch: "Ik zou graag willen weten of het mogelijk is om ...", spanish: "Me gustaría saber si es posible ..." },
  { category: "Vragen", dutch: "Is het nodig om enige ervaring te hebben?", spanish: "¿Es necesario tener alguna experiencia?" },
  
  // Kwaliteiten
  { category: "Kwaliteiten", dutch: "Ik kan goed met mensen opschieten en ik ben stressbestendig.", spanish: "Me relaciono bien con la gente y controlo bien las situaciones de estrés." },
  { category: "Kwaliteiten", dutch: "Ik ben beschikbaar gedurende de zomermaanden.", spanish: "Estoy a su disposición durante los meses de verano." },
  { category: "Kwaliteiten", dutch: "Ik spreek vloeiend Engels en Nederlands.", spanish: "Hablo inglés y holandés con fluidez." },
  { category: "Kwaliteiten", dutch: "Ik kan me redden in het Duits.", spanish: "Me defiendo en alemán." },
  
  // Afsluiting
  { category: "Afsluiting", dutch: "Ik voeg mijn curriculum vitae bij deze brief.", spanish: "A esta carta le adjunto mi currículo." },
  { category: "Afsluiting", dutch: "Uiteraard ben ik bereid om u nadere informatie te geven.", spanish: "Por supuesto estoy dispuesto/-a a darle más información." },
  { category: "Afsluiting", dutch: "Bij voorbaat dank.", spanish: "Gracias de antemano." },
  { category: "Afsluiting", dutch: "Hoogachtend,", spanish: "Le saluda atentamente," }
];

export const ANALYSIS_PROMPT = `
Je bent een strenge maar rechtvaardige docent Spaans. Je controleert een sollicitatiebrief van een 6-VWO leerling.
Je moet de tekst analyseren en opdelen in segmenten. Als een stuk tekst een fout bevat, markeer je dat segment.

Categoriseer fouten strikt in deze categorieën:
- 'spelling': Spelling of leestekens (Rood).
- 'missing': Er ontbreekt essentiële informatie gevraagd in de vacature (Blauw).
- 'grammar': Grammaticale fouten (bijv. concordantie) (Geel).
- 'tense': Verkeerde werkwoordstijd (Groen).
- 'order': Verkeerde woordvolgorde (Bruin).
- 'choice': Verkeerde woordkeuze (Teal/Groen).

Instructies:
1. Deel de tekst op in logische stukjes (zinsdelen).
2. Geef per stukje aan of het fout is en welk type fout.
3. Geef GEEN correctie in de tekst, alleen de markering.
4. 'explanation' is een hint in het Nederlands waarom het fout is (zonder het voor te zeggen).

Vacature Context:
{JOB_CONTEXT}

Geef het antwoord in JSON formaat:
{
  "segments": [
    { "text": "Estimados señores", "isError": false, "type": "none" },
    { "text": "yo buscar trabajo", "isError": true, "type": "grammar", "explanation": "Vervoeg het werkwoord 'buscar' en gebruik de juiste vorm." }
  ],
  "generalFeedback": "Een korte algemene opmerking over de brief in het Nederlands."
}
`;
