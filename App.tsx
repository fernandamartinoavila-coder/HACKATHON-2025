
import React, { useState, useEffect } from 'react';
import { generateJobAds, analyzeText, validateCorrection } from './services/geminiService';
import { JobAd, TextSegment, AnalysisResponse, CorrectionResult } from './types';
import JobCard from './components/JobCard';
import JobDetail from './components/JobDetail';
import Lenguateca from './components/Lenguateca';
import ReviewBoard from './components/ReviewBoard';
import { ERROR_LABELS, ERROR_COLORS, MAX_FEEDBACK_ATTEMPTS } from './constants';
import { 
    Send, RefreshCw, ChevronLeft, BookOpen, GraduationCap, 
    PenTool, AlertTriangle, CheckCircle, RotateCcw, Edit3 
} from 'lucide-react';

type AppStep = 'selection' | 'writing' | 'reviewing';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('selection');
  const [jobs, setJobs] = useState<JobAd[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobAd | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  
  // Writing & Analysis State
  const [studentText, setStudentText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  
  // Correction State
  const [selectedSegment, setSelectedSegment] = useState<TextSegment | null>(null);
  const [correctionInput, setCorrectionInput] = useState("");
  const [validatingCorrection, setValidatingCorrection] = useState(false);
  const [correctionResult, setCorrectionResult] = useState<CorrectionResult | null>(null);

  const [isLenguatecaOpen, setIsLenguatecaOpen] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    const newJobs = await generateJobAds();
    setJobs(newJobs);
    setLoadingJobs(false);
  };

  const handleSelectJob = (job: JobAd) => {
    setSelectedJob(job);
    setStep('writing');
    setStudentText("");
    setAnalysis(null);
    setFeedbackCount(0);
  };

  const handleRequestAnalysis = async () => {
    if (!selectedJob || !studentText.trim()) return;
    if (feedbackCount >= MAX_FEEDBACK_ATTEMPTS) return;

    setIsAnalyzing(true);
    setStep('reviewing');
    setSelectedSegment(null);
    setCorrectionResult(null);

    const result = await analyzeText(studentText, selectedJob);
    
    setAnalysis(result);
    setFeedbackCount(prev => prev + 1);
    setIsAnalyzing(false);
  };

  const handleSegmentClick = (segment: TextSegment) => {
    setSelectedSegment(segment);
    setCorrectionInput(segment.text); // Pre-fill with error text so they can edit it
    setCorrectionResult(null);
  };

  const handleSubmitCorrection = async () => {
    if (!selectedSegment || !selectedJob) return;

    setValidatingCorrection(true);
    const result = await validateCorrection(selectedSegment, correctionInput, studentText);
    setCorrectionResult(result);
    setValidatingCorrection(false);

    // If correct, update the local state immediately
    if (result.isCorrect && result.correctedText && analysis) {
        const updatedSegments = analysis.segments.map(s => 
            s.id === selectedSegment.id 
                ? { ...s, text: result.correctedText!, isError: false, type: 'none' as const } 
                : s
        );
        setAnalysis({ ...analysis, segments: updatedSegments });
    }
  };

  const handleResumeWriting = () => {
    // Reconstruct text from segments
    if (analysis) {
        const fullText = analysis.segments.map(s => s.text).join(" ");
        setStudentText(fullText.replace(/\s+/g, ' ').trim());
    }
    setStep('writing');
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 text-white p-2 rounded-lg shadow-sm">
                <GraduationCap size={24} />
            </div>
            <div>
                <h1 className="font-bold text-gray-900 text-xl leading-none">Entrenador de Cartas</h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">6VWO Sollicitatietraining</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {step !== 'selection' && (
                <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                    <span>Feedbackrondes:</span>
                    <div className="flex gap-1">
                        {[...Array(MAX_FEEDBACK_ATTEMPTS)].map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < feedbackCount ? 'bg-blue-300' : 'bg-blue-600'}`}></div>
                        ))}
                    </div>
                </div>
            )}
            {(step === 'writing' || step === 'reviewing') && (
                <button 
                    onClick={() => setIsLenguatecaOpen(true)}
                    className="flex items-center gap-2 bg-white border border-orange-200 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors shadow-sm"
                >
                    <BookOpen size={18} />
                    <span className="hidden sm:inline">Lenguateca</span>
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Step 1: Job Selection */}
        {step === 'selection' && (
          <div className="max-w-5xl mx-auto w-full p-6 overflow-y-auto">
            <div className="mb-10 text-center py-8">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Kies je vakantiebaan</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Selecteer een vacature in een Spaanstalig land en start met het schrijven van je sollicitatiebrief.
              </p>
            </div>

            {loadingJobs ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
                <p className="text-gray-500 font-medium animate-pulse">Vacatures ophalen...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} onSelect={handleSelectJob} />
                ))}
              </div>
            )}

            {!loadingJobs && (
                <div className="mt-16 text-center">
                    <button 
                        onClick={loadJobs}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors font-medium"
                    >
                        <RefreshCw size={18} /> Genereer nieuwe vacatures
                    </button>
                </div>
            )}
          </div>
        )}

        {/* Step 2 & 3: Writing / Reviewing */}
        {(step === 'writing' || step === 'reviewing') && selectedJob && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Job Context */}
            <div className="hidden xl:block w-1/4 min-w-[320px] max-w-[400px] border-r border-gray-200 bg-gray-50/50 overflow-y-auto p-4 custom-scrollbar">
                <button 
                    onClick={() => setStep('selection')}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft size={16} /> Andere vacature kiezen
                </button>
                <JobDetail job={selectedJob} />
            </div>

            {/* Middle Column: Editor / Review Board */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                 {/* Mobile Back Button */}
                 <div className="lg:hidden p-2 border-b">
                    <button onClick={() => setStep('selection')} className="text-sm text-gray-500 flex items-center"><ChevronLeft size={16}/> Terug</button>
                 </div>

                {step === 'writing' ? (
                    <>
                        <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-3 text-sm text-yellow-800 flex items-center gap-3">
                            <PenTool size={18} />
                            <span className="font-medium">Schrijfmodus: Schrijf je volledige brief. Vraag pas om feedback als je een goed concept hebt.</span>
                        </div>
                        <textarea
                            className="flex-1 w-full p-8 text-gray-800 font-mono text-lg focus:outline-none resize-none leading-relaxed"
                            placeholder="Estimados señores..."
                            value={studentText}
                            onChange={(e) => setStudentText(e.target.value)}
                            spellCheck={false}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
                        {/* Legend */}
                        <div className="bg-white border-b border-gray-200 p-2 shadow-sm flex flex-wrap justify-center gap-2 sm:gap-4 text-xs">
                             {Object.entries(ERROR_LABELS).map(([type, label]) => {
                                if(type === 'none') return null;
                                const colorClass = ERROR_COLORS[type as import('./types').ErrorType].split(' ')[0]; // get bg class
                                return (
                                    <div key={type} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-gray-100 shadow-sm">
                                        <div className={`w-3 h-3 rounded-full ${colorClass.replace('bg-', 'bg-')}`}></div>
                                        <span className="text-gray-600 font-medium">{label}</span>
                                    </div>
                                )
                             })}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 md:p-10">
                            {isAnalyzing ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Je brief wordt nagekeken...</h3>
                                        <p className="text-gray-500">De docent controleert op spelling, grammatica en inhoud.</p>
                                    </div>
                                </div>
                            ) : analysis ? (
                                <ReviewBoard 
                                    segments={analysis.segments} 
                                    onSegmentClick={handleSegmentClick}
                                    selectedSegmentId={selectedSegment?.id || null}
                                />
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Footer Action Bar */}
                <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    <div className="text-sm text-gray-500 font-medium">
                        {studentText.split(' ').filter(w => w.length > 0).length} woorden
                    </div>
                    
                    {step === 'writing' ? (
                         <button
                            onClick={handleRequestAnalysis}
                            disabled={studentText.length < 20 || feedbackCount >= MAX_FEEDBACK_ATTEMPTS}
                            className={`flex items-center gap-2 py-2.5 px-6 rounded-lg font-bold text-white transition-all transform active:scale-95 ${
                                studentText.length < 20 || feedbackCount >= MAX_FEEDBACK_ATTEMPTS
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-orange-200'
                            }`}
                        >
                            {feedbackCount >= MAX_FEEDBACK_ATTEMPTS ? 'Limiet bereikt' : 'Kijk na'}
                            <Send size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleResumeWriting}
                            className="flex items-center gap-2 py-2.5 px-6 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                            <Edit3 size={18} />
                            <span className="hidden sm:inline">Terug naar schrijven</span>
                            <span className="sm:hidden">Bewerk</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Right Column: Interaction Panel (Only visible in Review Mode) */}
            {step === 'reviewing' && !isAnalyzing && (
                <div className="w-full lg:w-1/3 min-w-[320px] bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl z-20">
                    <div className="p-5 border-b border-gray-200 bg-orange-50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                            <AlertTriangle className="text-orange-600" size={20}/>
                            Verbeterpunt
                        </h3>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        {!selectedSegment ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <PenTool size={32} className="text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-600 mb-2">Nog geen fout geselecteerd</p>
                                <p className="text-sm">Klik op een gekleurd stuk tekst in je brief om deze te verbeteren.</p>
                                
                                {analysis && (
                                    <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left w-full border border-blue-100">
                                        <h4 className="font-bold text-blue-900 text-sm mb-2">Algemene feedback:</h4>
                                        <p className="text-sm text-blue-800 italic">"{analysis.generalFeedback}"</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                {/* Error Card */}
                                <div className={`p-4 rounded-lg border-l-4 shadow-sm ${ERROR_COLORS[selectedSegment.type].replace('decoration-', 'border-')}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                                            {ERROR_LABELS[selectedSegment.type]}
                                        </span>
                                    </div>
                                    <div className="text-lg font-medium opacity-90 line-through decoration-2 decoration-current">
                                        {selectedSegment.text}
                                    </div>
                                </div>

                                {/* Hint */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                    <div className="absolute -top-2 left-4 bg-white px-2 text-xs font-bold text-gray-500">Hint</div>
                                    <p className="text-gray-700 italic text-sm pt-2">
                                        {selectedSegment.explanation}
                                    </p>
                                </div>

                                {/* Correction Input */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Jouw verbetering:
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={correctionInput}
                                            onChange={(e) => setCorrectionInput(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow font-mono text-sm"
                                            placeholder="Typ hier de verbetering..."
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitCorrection()}
                                        />
                                        {correctionResult?.isCorrect && (
                                            <div className="absolute right-3 top-3 text-green-500">
                                                <CheckCircle size={20} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                {!correctionResult?.isCorrect && (
                                    <button
                                        onClick={handleSubmitCorrection}
                                        disabled={validatingCorrection || correctionInput === selectedSegment.text}
                                        className={`w-full py-3 rounded-lg font-bold text-white transition-all flex justify-center items-center gap-2 ${
                                            validatingCorrection || correctionInput === selectedSegment.text
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-orange-600 hover:bg-orange-700 shadow-md'
                                        }`}
                                    >
                                        {validatingCorrection ? 'Controleren...' : 'Controleer Verbetering'}
                                    </button>
                                )}

                                {/* Feedback Result */}
                                {correctionResult && (
                                    <div className={`p-4 rounded-lg border ${correctionResult.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                        <div className="flex items-center gap-2 font-bold mb-1">
                                            {correctionResult.isCorrect ? <CheckCircle size={18}/> : <RotateCcw size={18}/>}
                                            {correctionResult.isCorrect ? 'Goed gedaan!' : 'Nog niet helemaal...'}
                                        </div>
                                        <p className="text-sm">{correctionResult.feedback}</p>
                                        {correctionResult.isCorrect && (
                                            <p className="text-xs mt-2 opacity-70">De tekst is aangepast in je brief.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        )}
      </main>

      {/* Slide-over reference */}
      <Lenguateca isOpen={isLenguatecaOpen} onClose={() => setIsLenguatecaOpen(false)} />
    </div>
  );
};

export default App;
